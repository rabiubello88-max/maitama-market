"use client";

import React, { useState } from "react";

interface CartItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

export default function CheckoutModal({ isOpen, onClose, cartItems }: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  if (!isOpen) return null;

  const merchantPhoneNumber = "2347037700658"; 

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      alert("Please fill in all fields before proceeding.");
      return;
    }

    const orderId = `MM-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 1500;
    const grandTotal = subtotal + deliveryFee;

    const itemsSummary = cartItems.length > 0 
      ? cartItems.map((item) => `• *${item.name}* (${item.quantity} ${item.unit}) — ₦${(item.price * item.quantity).toLocaleString()}`).join("\n")
      : "• *Selected Store Items*";

    const message = `🛒 *NEW ORDER RECEIVED — Maitama Market*
Order ID: #${orderId}

👤 *CUSTOMER DETAILS*
Name: ${customerName}
Phone: ${phone}
Address: ${address}

📦 *ORDER SUMMARY*
${itemsSummary}

💳 *PAYMENT & TOTAL*
Subtotal: ₦${subtotal.toLocaleString()}
Delivery Fee: ₦${deliveryFee.toLocaleString()}
*Total Amount: ₦${grandTotal.toLocaleString()}*
Payment Method: Transfer on Delivery

🚚 *ACTION REQUIRED*
Please confirm item availability and dispatch delivery.`;

    const encodedMessage = encodeURIComponent(message);
    window.location.href = `https://wa.me/${merchantPhoneNumber}?text=${encodedMessage}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl relative text-black">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-800">Checkout Details</h2>
        <p className="text-sm text-gray-600">Enter your delivery info to complete your order on WhatsApp.</p>

        <form onSubmit={handleWhatsAppCheckout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Amina Bello"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 08012345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address / Area</label>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-green-500"
              placeholder="e.g. House 12, Panama Street, Maitama"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Send Order to WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}