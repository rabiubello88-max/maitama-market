"use client";

import React, { useState } from "react";

interface CartItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export default function CheckoutForm() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Updated with your official WhatsApp number
  const merchantPhoneNumber = "2347037700658"; 

  // Sample cart items — update/connect this with your actual cart state when ready
  const cartItems: CartItem[] = [
    { name: "Fresh Tomatoes", quantity: 3, unit: "basket", price: 2500 },
    { name: "Sweet Oranges", quantity: 1, unit: "bag", price: 4000 },
  ];

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation check
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      alert("Please fill in your name, phone number, and delivery address before proceeding.");
      return;
    }

    const orderId = `MM-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 1500; // Standard estimated delivery fee
    const grandTotal = subtotal + deliveryFee;

    const itemsSummary = cartItems
      .map(
        (item) =>
          `• *${item.name}* (${item.quantity} ${item.unit}) — ₦${(
            item.price * item.quantity
          ).toLocaleString()}`
      )
      .join("\n");

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
    const whatsappUrl = `https://wa.me/${merchantPhoneNumber}?text=${encodedMessage}`;

    // Direct redirection to avoid popup blockers
    window.location.href = whatsappUrl;
  };

  return (
    <form onSubmit={handleWhatsAppCheckout} className="max-w-md mx-auto p-6 space-y-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800">Delivery Information</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
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
          className="w-full p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
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
          className="w-full p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g. House 12, Panama Street, Maitama"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
      >
        Complete Order on WhatsApp
      </button>
    </form>
  );
}