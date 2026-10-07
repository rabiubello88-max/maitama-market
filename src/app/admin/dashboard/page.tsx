"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default function AdminDashboardPage() {
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPrices, setEditingPrices] = useState<{ [key: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fruits");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("piece");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/admin/login");
        return;
      }
      fetchProducts();
    }
    loadDashboard();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setProducts(data);
      const initialPrices: { [key: string]: number } = {};
      data.forEach((p) => {
        initialPrices[p.id] = p.price;
      });
      setEditingPrices(initialPrices);
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Product Management</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowPasswordModal(true);
              }}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Inventory & Controls</h2>
          {loading ? (
            <p className="text-gray-500">Loading inventory...</p>
          ) : (
            <div className="space-y-4">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-4">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-sm text-gray-500">₦{p.price} / {p.unit}</span>
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