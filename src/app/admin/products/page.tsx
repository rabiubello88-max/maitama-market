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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrices, setEditingPrices] = useState<{ [key: string]: number }>({});

  // New product form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
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
    const updatedPrice = editingPrices[id];
    const { error } = await supabase
      .from("products")
      .update({ price: updatedPrice })
      .eq("id", id);

    if (error) {
      alert("Failed to update price");
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, price: updatedPrice } : p))
      );
      alert("Price updated successfully!");
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
                placeholder="e.g. Tomatoes"
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
                placeholder="2500"
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
                placeholder="e.g. basket, kg, piece"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black"
                placeholder="https://images.unsplash.com/..."
              />
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

        {/* Product Inventory List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Inventory & Price Control</h2>
          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-500 text-sm">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price (₦)</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => (
                    <tr key={p.id} className="text-sm">
                      <td className="py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="py-3 text-gray-500">{p.category}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span>₦</span>
                          <input
                            type="number"
                            value={editingPrices[p.id] ?? p.price}
                            onChange={(e) => handlePriceChange(p.id, e.target.value)}
                            className="w-24 p-1 border border-gray-300 rounded text-black font-semibold"
                          />
                          <span className="text-xs text-gray-400">/ {p.unit}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            p.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {p.is_available ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => handleSavePrice(p.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Save Price
                        </button>
                        <button
                          onClick={() => handleToggleAvailability(p.id, p.is_available)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            p.is_available
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {p.is_available ? "Mark Out of Stock" : "Mark Available"}
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