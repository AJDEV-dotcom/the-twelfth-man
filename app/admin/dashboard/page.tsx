"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, ArrowLeft, Loader2, Filter, AlertTriangle, CheckCircle, Package } from "lucide-react";
import toast from "react-hot-toast";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
};

// Define categories for filtering
const CATEGORIES = ["All", "Footballs", "Boots", "Kits & Apparel", "Training Gear", "Accessories", "Goalkeeper"];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, category, image_url")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete Product Logic with Custom Toast UI
  const handleDelete = async (id: number) => {
    toast.custom((t) => (
      <div className="bg-zinc-950 border border-red-500/30 rounded-2xl p-6 shadow-2xl max-w-sm w-full flex flex-col gap-4 backdrop-blur-xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-3 text-red-500">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-lg font-black uppercase tracking-wider">Delete Kit?</h3>
        </div>
        <p className="text-gray-400 text-sm font-medium leading-relaxed">
          Are you sure you want to delete this product? This action cannot be undone and will remove it from the shop immediately.
        </p>
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading("Deleting from locker...");
              
              const { error } = await supabase.from("products").delete().eq("id", id);

              if (error) {
                toast.error("Error deleting product", { id: loadingToast });
                console.error(error);
              } else {
                toast.success("Product deleted successfully!", { 
                  id: loadingToast, 
                  icon: <CheckCircle className="w-5 h-5 text-green-500" /> 
                });
                // Optimistic update
                setProducts(products.filter((p) => p.id !== id));
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-red-900/20"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity }); // Stays open until clicked
  };

  // Filter products based on search AND category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-12 px-4 selection:bg-blue-600 selection:text-white">
      {/* Background Noise */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors mb-2 text-sm uppercase tracking-widest font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex gap-4 border-b border-white/10 mb-8">
          <Link href="/admin/dashboard" className="py-2 font-bold uppercase tracking-widest text-sm text-blue-500 border-b-2 border-blue-500">
            Products ({products.length})
          </Link>
          <Link href="/admin/orders" className="py-2 font-bold uppercase tracking-widest text-sm text-gray-500 hover:text-white transition-colors">
            Orders
          </Link>
          <Link href="/admin/add" className="ml-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-900/20 active:scale-95">
            <Plus className="w-4 h-4" /> Add New Kit
          </Link>
        </div>

        {/* CONTROLS SECTION */}
        <div className="space-y-6 mb-8">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search locker..."
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-600 transition-colors placeholder-gray-600 shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center mr-2 text-gray-500">
              <Filter className="w-4 h-4" />
            </div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    : "bg-transparent text-gray-500 border-white/10 hover:border-white hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Locker Room...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                    <th className="p-6">Product</th>
                    <th className="p-6">Category</th>
                    <th className="p-6">Price</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-black rounded-lg overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-blue-500/50 transition-colors">
                            <img src={product.image_url || "https://via.placeholder.com/100"} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-bold text-white group-hover:text-blue-500 transition-colors line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-gray-400 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wide group-hover:bg-white/10 transition-colors">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-6 font-mono text-white font-bold group-hover:text-green-400 transition-colors">${product.price}</td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                          {/* EDIT BUTTON */}
                          <Link 
                            href={`/admin/edit/${product.id}`}
                            className="p-2 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-lg transition-colors border border-white/5 hover:border-blue-500"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          
                          {/* DELETE BUTTON */}
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white rounded-lg transition-colors border border-white/5 hover:border-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-16 text-center">
                        <p className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-2">No items found</p>
                        <p className="text-xs text-gray-600">Try adjusting your filters or add a new kit.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}