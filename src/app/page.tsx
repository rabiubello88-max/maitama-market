'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Tag, Search, Plus, Minus, Trash2, Store, MessageCircle } from 'lucide-react'

// Set your business WhatsApp phone number here (International format without '+' or spaces)
const WHATSAPP_PHONE_NUMBER = '2347037700658' // Replace with your phone number, e.g. 2348123456789

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  unit: string
  image_url: string
}

interface CartItem extends Product {
  quantity: number
}

export default function CustomerStorefront() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setProducts(data)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [supabase])

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id)
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Generate WhatsApp Order Link & Redirect
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return

    let itemsText = cart
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.name}* (${item.quantity} ${item.unit}) - ₦${(
            item.price * item.quantity
          ).toLocaleString()}`
      )
      .join('\n')

    let message = `🛒 *NEW ORDER - MAITAMA MARKET*\n\n`
    if (customerName) message += `👤 *Customer Name:* ${customerName}\n`
    if (deliveryAddress) message += `📍 *Delivery Address:* ${deliveryAddress}\n`
    message += `\n*Order Summary:*\n${itemsText}\n\n`
    message += `💰 *Total Amount:* ₦${cartTotal.toLocaleString()}\n\n`
    message += `Please confirm availability and delivery timeframe. Thank you!`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`

    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-emerald-800 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-7 h-7 text-emerald-300" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Maitama Market</h1>
              <p className="text-xs text-emerald-200">Fresh Produce Delivered</p>
            </div>
          </div>

          <div className="relative">
            <button className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded-xl text-sm font-semibold transition">
              <ShoppingBag className="w-5 h-5 text-emerald-200" />
              <span>Cart ({cartItemCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero & Search Banner */}
      <section className="bg-emerald-900 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Fresh Fruits & Vegetables directly from Maitama
          </h2>
          <p className="text-emerald-200 text-sm max-w-xl mx-auto">
            Select your items and place your order directly via WhatsApp for fast local delivery.
          </p>

          <div className="relative max-w-md mx-auto pt-2">
            <Search className="w-5 h-5 absolute left-3 top-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tomatoes, mangoes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Products Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['all', 'fruits', 'vegetables', 'others'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              Loading fresh produce...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed text-gray-500 text-sm">
              No produce found matching your query.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-44 object-cover"
                      />
                    ) : (
                      <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">
                        <Tag className="w-8 h-8" />
                      </div>
                    )}

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md">
                          {product.category}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold">
                          / {product.unit}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between mt-2">
                    <span className="text-lg font-extrabold text-emerald-800">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Cart Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" /> Your Order
          </h2>

          {cart.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              Your cart is empty. Click + Add on items to build your order.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-gray-500">
                        ₦{item.price.toLocaleString()} x {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="px-2 font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Details Inputs */}
              <div className="space-y-2 border-t pt-3">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Delivery Address / Area (Optional)"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex justify-between text-sm font-bold text-gray-900">
                  <span>Total Amount:</span>
                  <span className="text-emerald-700">
                    ₦{cartTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs tracking-wide transition shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Order via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}