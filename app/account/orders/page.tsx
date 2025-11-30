"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Package, Clock, DollarSign, User, MapPin } from "lucide-react";
import toast from "react-hot-toast";

type Order = {
  id: number;
  order_total: number;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string;
};

export default function UserOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // Initial check state

  // 1. Authenticate and Fetch User's Orders
  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthChecking(false);

      if (!user) {
        // User not logged in, redirect to login page
        toast.error("Please log in to view your order history.");
        router.push("/login");
        return;
      }

      // Fetch Orders specific to this user
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at, order_total, customer_name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load your order history.");
      } else {
        setOrders(data as Order[]);
      }
      setLoading(false);
    }
    checkAuthAndFetch();
  }, [router]);

  const statusColor = (status: string) => {
    if (status === 'Delivered') return 'text-green-400 bg-green-900/20 border-green-500/30';
    if (status === 'Shipped') return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    if (status === 'Cancelled') return 'text-red-400 bg-red-900/20 border-red-500/30';
    return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'; // Processing
  }

  if (isAuthChecking || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-32">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-12 px-4 selection:bg-blue-600 selection:text-white">
      {/* Background Noise */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors mb-2 text-sm uppercase tracking-widest font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Order History
            </h1>
          </div>
          <p className="text-gray-500 font-medium text-lg uppercase tracking-widest hidden md:block">
            {orders.length} Total Orders
          </p>
        </div>

        {/* Order List */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                  <th className="p-6">Order ID</th>
                  <th className="p-6">Date</th>
                  <th className="p-6">Total</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                      
                      {/* Order ID */}
                      <td className="p-6 font-mono text-sm text-blue-400">#{order.id}</td>
                      
                      {/* Date */}
                      <td className="p-6 text-sm text-gray-400 whitespace-nowrap">
                        <Clock className="w-4 h-4 text-gray-600 inline mr-2" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>

                      {/* Total */}
                      <td className="p-6 font-mono font-bold text-white">${order.total_amount.toFixed(2)}</td>
                      
                      {/* Status */}
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor(order.status)}`}>
                            {order.status}
                        </span>
                      </td>

                      {/* View Details Link */}
                      <td className="p-6">
                        <div className="flex items-center justify-end">
                          <Link href={`/admin/orders/${order.id}`} className="p-2 bg-white/10 hover:bg-blue-600 text-gray-400 hover:text-white rounded-lg transition-colors" title="View Details">
                            <Package className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-gray-500 uppercase tracking-widest text-sm font-bold">
                      No orders found in your history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}