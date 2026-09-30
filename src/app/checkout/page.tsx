"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Product {
  id?: string | number;
  name: string;
  price: number;
  unit: string;
  category: string;
  image_url?: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form State for New Product
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("piece");
  const [category, setCategory] = useState("Fruits");
  const [imageUrl, setImageUrl] = useState("");

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Add Product Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const newProduct = {
      name,
      price: parseFloat(price),
      unit,
      category,
      image_url: imageUrl || "https://via.placeholder.com/150",
    };

    const { error } = await supabase.from("products").insert([newProduct]);

    if (error) {
      setMessage(`❌ Error adding product: ${error.message}`);
    } else {
      setMessage("✅ Product added successfully!");
      // Reset Form
      setName("");
      setPrice("");
      setImageUrl("");
      fetchProducts();
    }
    setSaving(false);
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert(`Error deleting product: ${error.message}`);
    } else {
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maitama Market Admin</h1>
            <p className="text-sm text-gray-500">Manage products and inventory</p>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-green-600 hover:text-green-700 underline"
          >
            ← View Main Store
          </a>
        </div>

        {/* Add Product Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-bold mb-4 text-gray-800">➕ Add New Product</h2>
          
          {message && (
            <div className={`p-3 mb-4 rounded text-sm ${message.includes("❌") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Oranges"
                className="w-full p-2.5 border rounded-md text-sm text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Price (₦)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 600"
                className="w-full p-2.5 border rounded-md text-sm text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 border rounded-md text-sm text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="piece">piece</option>
                <option value="kg">kg</option>
                <option value="basket">basket</option>
                <option value="bunch">bunch</option>
                <option value="crate">crate</option>
                <option value="bag">bag</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 border rounded-md text-sm text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Tubers">Tubers</option>
                <option value="Grains">Grains</option>
                <option value="Spices">Spices</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Image URL (Optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full p-2.5 border rounded-md text-sm text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50"
              >
                {saving ? "Saving Product..." : "Save Product to Store"}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Products List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-bold mb-4 text-gray-800">📦 Inventory List ({products.length})</h2>
          
          {loading ? (
            <p className="text-sm text-gray-500">Loading inventory from Supabase...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-500">No products found. Add your first item above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{item.name}</td>
                      <td className="p-3 text-gray-600">{item.category || "N/A"}</td>
                      <td className="p-3 font-semibold text-green-700">₦{item.price?.toLocaleString()}</td>
                      <td className="p-3 text-gray-600">{item.unit || "piece"}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => item.id && handleDeleteProduct(item.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}