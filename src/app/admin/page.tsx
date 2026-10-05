"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Tubers",
  "Spices & Seasonings",
  "Grains & Oils",
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

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrices, setEditingPrices] = useState<{ [key: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // New product form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("piece");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  // Handle local image file upload and convert to Data URL
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

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
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Product Management</h1>

        {/* Add Product Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black"
                placeholder="e.g. Mangoes"
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

            {/* File Upload Field */}
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
                  <span className="text-xs text-green-600 font-medium">Image ready for upload</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition"
              >
                {submitting ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>

        {/* Product Inventory & Price List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Inventory & Price Control</h2>
          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : (
            <div className="space-y-4">
              {products.map((p) => (
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
                      className="w-24 p-1.5 border border-gray-300 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none"
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

                  {/* Availability & Delete Actions */}
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
    </div>
  );
}