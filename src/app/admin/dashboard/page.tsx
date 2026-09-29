import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Store, LogOut, Package, ShoppingBag, Users } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-800 rounded-lg">
            <Store className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Maitama Market</h1>
            <p className="text-xs text-emerald-300">Admin Operations Dashboard</p>
          </div>
        </div>

        <form action={async () => {
          'use server'
          const supabase = await createClient()
          await supabase.auth.signOut()
          redirect('/admin/login')
        }}>
          <button
            type="submit"
            className="flex items-center gap-2 text-xs bg-emerald-900 hover:bg-emerald-800 text-emerald-100 px-3.5 py-2 rounded-lg border border-emerald-700/50 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-600 mt-1">Logged in as <span className="font-semibold text-emerald-800">{user.email}</span></p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">WhatsApp Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Active Admins</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}