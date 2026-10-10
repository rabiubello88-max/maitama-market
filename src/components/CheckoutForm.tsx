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

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  if (!isOpen) return null;

  const merchantPhoneNumber = "2347037700658";
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatNaira = (amount: number) =>
    `₦${amount.toLocaleString("en-NG")}`;

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      alert("Please fill in all fields before proceeding.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      return;
    }

    const orderId = `MM-${Math.floor(1000 + Math.random() * 9000)}`;

    const itemsSummary = cartItems
      .map(
        (item) =>
          `• *${item.name}* (${item.quantity} ${item.unit}) — ${formatNaira(
            item.price * item.quantity
          )}`
      )
      .join("\n");

    const message = `🛒 *NEW ORDER RECEIVED — Maitama Online Farmers Market*
Order ID: #${orderId}

👤 *CUSTOMER DETAILS*
Name: ${customerName.trim()}
Phone: ${phone.trim()}
Address: ${address.trim()}

📦 *ORDER SUMMARY*
${itemsSummary}

💳 *GROCERY PAYMENT*
*Total for Items: ${formatNaira(subtotal)}*

Payment Method: Bank Transfer — Before Dispatch

*TRANSFER DETAILS*
Bank: Moniepoint
Account Name: Elqena LTD
Account Number: 6656786409

Full payment for the groceries must be received and confirmed before dispatch.

🚚 *DELIVERY ARRANGEMENT*
Delivery fee is NOT included in the grocery total.

After the order has been processed and payment confirmed, book a Bolt ride using the customer's delivery address.

The customer pays the actual Bolt delivery fare directly to the Bolt rider upon delivery. The fare is determined when the Bolt ride is booked.



    const encodedMessage = encodeURIComponent(message);
    window.location.href =
      `https://wa.me/${merchantPhoneNumber}?text=${encodedMessage}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl relative text-black my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl font-bold"
          aria-label="Close checkout"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-800">
          Checkout Details
        </h2>

        <p className="text-sm text-gray-600">
          Enter your delivery details and submit your order through WhatsApp.
        </p>

        <form onSubmit={handleWhatsAppCheckout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address / Area
            </label>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-green-500"
              placeholder="e.g. House 12, Panama Street, Maitama"
            />
          </div>

          <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-gray-800">
              Grocery Payment
            </h3>

            <div className="flex justify-between gap-3 text-sm">
              <span>Subtotal for items</span>
              <span className="font-bold">{formatNaira(subtotal)}</span>
            </div>

            <p className="text-xs text-gray-600">
              Delivery is excluded from this amount.
            </p>

            <div className="border-t border-green-200 pt-3 space-y-1 text-sm">
              <p><strong>Bank:</strong> Moniepoint</p>
              <p><strong>Account Name:</strong> Elqena LTD</p>
              <p><strong>Account Number:</strong> 6656786409</p>
            </div>

            <p className="text-sm font-semibold text-gray-800">
              Please transfer the full grocery amount and wait for payment
              confirmation before dispatch.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-3 text-sm text-gray-700 space-y-1">
            <h3 className="font-bold">Bolt Delivery</h3>
            <p>
              After your order is processed and payment is confirmed, we will
              arrange a Bolt ride to your delivery address.
            </p>
            <p>
              You will pay the actual Bolt fare directly to the rider upon
              delivery. This fee is separate from your grocery total.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Submit Order on WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}
