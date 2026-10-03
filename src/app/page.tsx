"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CheckoutModal from "@/components/CheckoutForm";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fixed list of categories matching Admin panel exactly
const CATEGORIES = [
  "All",
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

interface CartItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_available", true);

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const updated = current + delta;
      if (updated <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: updated };
    });
  };

  // Case-insensitive filtering so older database entries ('fruits', 'vegetables') still match
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  const totalCartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const cartDetails: CartItem[] = Object.entries(cart)
    .map(([id, qty]) => {
      const prod = products.find((p) => p.id === id);
      if (!prod) return null;
      return {
        name: prod.name,
        quantity: qty,
        unit: prod.unit,
        price: prod.price,
      };
    })
    .filter((item): item is CartItem => item !== null);

  const subtotal = cartDetails.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-green-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wide">Maitama Market</h1>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-green-800 px-4 py-2 rounded-lg font-medium hover:bg-green-900 transition flex items-center gap-2"
          >
            🛒 Cart
            {totalCartItemsCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalCartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Fresh Produce & Groceries</h2>

        {/* Category Filters matching Admin dropdown */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-green-700 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-500">No products available in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const qty = cart[product.id] || 0;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between"
                >
                  <div>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2 capitalize">{product.category}</p>
                    <p className="text-green-700 font-bold">
                      ₦{product.price.toLocaleString()}{" "}
                      <span className="text-xs text-gray-500 font-normal">
                        / {product.unit}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4">
                    {qty === 0 ? (
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
                      >
                        Add to Order
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-8 h-8 bg-white rounded-md font-bold text-gray-700 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="font-bold text-gray-800">{qty}</span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-8 h-8 bg-white rounded-md font-bold text-gray-700 hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          />
          <div className="relative z-50 w-full max-w-md bg-white h-full p-6 shadow-2xl flex flex-col justify-between text-black">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Your Order Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-500 hover:text-black text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {cartDetails.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {cartDetails.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b pb-3"
                    >
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.quantity} {item.unit} × ₦{item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartDetails.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Subtotal:</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Order via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Delivery Info Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartDetails}
      />
    </div>
  );
}