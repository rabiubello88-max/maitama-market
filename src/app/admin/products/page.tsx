'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Tag, Package, Upload, Loader2, ImageOff } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  unit: string
  image_url: string
  is_available: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('fruits')
  const [unit, setUnit] = useState('kg')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const supabase = createClient()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    let uploadedImageUrl = ''

    if (imageFile) {
      // Validate file size (Limit to 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Please select an image under 5MB.')
        setIsSubmitting(false)
        return
      }

      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`)
        setIsSubmitting(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      uploadedImageUrl = publicUrlData.publicUrl
    }

    const { error: insertError } = await supabase.from('products').insert([
      {
        name,
        description,
        price: parseFloat(price),
        category,
        unit,
        image_url: uploadedImageUrl || null,
      },
    ])

    if (insertError) {
      setError(insertError.message)
    } else {
      setName('')
      setDescription('')
      setPrice('')
      setImageFile(null)
      fetchProducts()
    }
    setIsSubmitting(false)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      fetchProducts()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-800 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Maitama Market Admin</h1>
            <p className="text-xs text-emerald-200">Product Inventory Management</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-xs bg-emerald-700 hover:bg-emerald-600 px-3 py-2 rounded-lg font-medium transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Product Form */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" /> Add New Produce
          </h2>

          {error && (
            <div className="p-3 mb-4 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sweet Bananas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="fruits">Fruits</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="kg">Per kg</option>
                  <option value="basket">Per Basket</option>
                  <option value="piece">Per Piece</option>
                  <option value="bag">Per Bag</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Price (₦)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 1500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Product Photo (Max 5MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                placeholder="Brief description of quality or origin..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading & Adding...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Add Product
                </>
              )}
            </button>
          </form>
        </section>

        {/* Product List */}
        <section className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" /> Current Inventory ({products.length})
          </h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading products...</p>
          ) : products.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No products added yet.</p>
              <p className="text-xs text-gray-400">Use the form on the left to add your first item.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {products.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border"
                        onError={(e) => {
                          // Fallback if image fails to load
                          ;(e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <ImageOff className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-gray-600 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {item.category}
                        </span>
                        <span className="font-semibold text-emerald-700">
                          ₦{item.price.toLocaleString()} / {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteProduct(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}