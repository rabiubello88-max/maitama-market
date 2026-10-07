"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Tubers",
  "Spices & Seasonings",
  "Grains & Oils",
  "Protein & Seafood",
];

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image_url: string;
  is_available: boolean;
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPrices, setEditingPrices] = useState<{ [key: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Edit Modal/State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form States (Used for both Add & Edit)
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("piece");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Password Change Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndFetch() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        await supabase.auth.signOut();
        router.push("/admin/login");
        return;
      }

      fetchProducts();
    }

    checkAuthAndFetch();
  }, [router]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
      const initialPrices: { [key: string]: number } = {};
      data.forEach((p) => {
        initialPrices[p.id] = p.price;
      });
      setEditingPrices(initialPrices);
    }
    setLoading(false);
  }

  // File to Base64 conversion
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ is_available: !currentStatus })
      .eq("id", id);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_available: !currentStatus } : p))
      );
    }
  };

  const handlePriceChange = (id: string, newPrice: string) => {
    setEditingPrices((prev) => ({
      ...prev,
      [id]: Number(newPrice),
    }));
  };

  const handleSavePrice = async (id: string) => {
    setSavingId(id);
    const newPrice = editingPrices[id];

    const { error } = await supabase
      .from("products")
      .update({ price: newPrice })
      .eq("id", id);

    if (error) {
      alert("Failed to update price");
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
      );
      alert("Price updated successfully!");
    }
    setSavingId(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Error deleting product");
    }
  };

  // Open Edit Form
  const startEditing = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price.toString());
    setUnit(p.unit);
    setImageUrl(p.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setUnit("piece");
    setImageUrl("");
    setCategory(CATEGORIES[0]);
  };

  // Handle Form Submit for both Add & Full Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingProduct) {
      // Update existing item
      const { error } = await supabase
        .from("products")
        .update({
          name,
          category,
          price: Number(price),
          unit,
          image_url: imageUrl,
        })
        .eq("id", editingProduct.id);

      if (!error) {
        cancelEditing();
        fetchProducts();
      } else {
        alert("Error updating product details");
      }
    } else {
      // Add new item
      const { error } = await supabase.from("products").insert([
        {
          name,
          category,
          price: Number(price),
          unit,
          image_url: imageUrl,
          is_available: true,
        },
      ]);

      if (!error) {
        setName("");
        setPrice("");
        setImageUrl("");
        fetchProducts();
      } else {
        alert("Error adding product");
      }
    }
    setSubmitting(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);

    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, newPassword }),
    });

    const data = await res.json();
    setUpdatingPassword(false);

    if (!res.ok) {
      alert(data.error || "Failed to update password.");
    } else {
      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setPin("");
      setNewPassword("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Filtered list based on Search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Product Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add / Edit Product Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
            </h2>
            {editingProduct && (
              <button
                type="button"
                onClick={cancelEditing}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitForm} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black"
                placeholder="e.g. Fresh Salmon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price (₦)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black"
                placeholder="700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black"
                placeholder="e.g. piece, kg, basket"
              />
            </div>

            {/* Image File Upload */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
              />

              {imageUrl && (
                <div className="flex items-center gap-3 mt-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <span className="text-xs text-green-600 font-medium">Image attached</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition"
              >
                {submitting
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product Details"
                  : "Add Product"}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Inventory Table & Search Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Inventory & Controls</h2>

            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search inventory by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 p-2 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Loading inventory...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No products matched your search.</p>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap md:flex-nowrap items-center justify-between border-b pb-4 gap-4"
                >
                  <div className="flex items-center gap-3 w-full md:w-1/3">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{p.category}</p>
                    </div>
                  </div>

                  {/* Inline Price Editing Box */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-700">₦</span>
                    <input
                      type="number"
                      value={editingPrices[p.id] ?? p.price}
                      onChange={(e) => handlePriceChange(p.id, e.target.value)}
                      className="w-24 p-1.5 border border-gray-300 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                    />
                    <span className="text-xs text-gray-500">/ {p.unit}</span>

                    <button
                      onClick={() => handleSavePrice(p.id)}
                      disabled={savingId === p.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
                    >
                      {savingId === p.id ? "Saving..." : "Save Price"}
                    </button>
                  </div>

                  {/* Item Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAvailability(p.id, p.is_available)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.is_available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.is_available ? "In Stock" : "Out of Stock"}
                    </button>

                    {/* Edit Item Button */}
                    <button
                      onClick={() => startEditing(p)}
                      className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1 rounded-lg text-xs font-medium"
                    >
                      Edit
                    </button>

                    {/* Delete Item Button */}
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Change Admin Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Security PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-black text-sm"
                  placeholder="Enter security PIN"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-black text-sm"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-4 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  {updatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}