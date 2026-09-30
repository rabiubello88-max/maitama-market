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

  // Replace with your active market WhatsApp number (country code + number, no '+' or spaces)
  const merchantPhoneNumber = "2348000000000"; 

  // Sample items — update/connect this with your actual cart state when ready
  const cartItems: CartItem[] = [
    { name: "Oranges", quantity: 2, unit: "piece", price: 600 },
    { name: "Mango", quantity: 1, unit: "piece", price: 1000 },
  ];

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    const itemsSummary = cartItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} (${item.quantity} ${item.unit}) - ₦${(
            item.price * item.quantity
          ).toLocaleString()}`
      )
      .join("\n");

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const message = `🛒 *NEW ORDER - MAITAMA MARKET*

👤 *Customer Details:*
• *Name:* ${customerName}
• *Phone:* ${phone}
• *Delivery Address:* ${address}

📦 *Order Summary:*
${itemsSummary}

💰 *Total Amount:* ₦${totalAmount.toLocaleString()}
💳 *Payment Method:* Transfer before Delivery
⚠️ *Note:* Delivery fee to be handled by customer upon arrival.

Please confirm availability and delivery timeframe. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${merchantPhoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
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