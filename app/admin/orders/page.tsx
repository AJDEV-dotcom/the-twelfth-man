"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Loader2, ArrowLeft, Package, User, DollarSign, Edit, Search } from "lucide-react";
import toast from "react-hot-toast";

type Order = {
  id: number;
  customer_name: string;
  order_total: number;
  total_amount: number;
  status: string;
  created_at: string;
  phone_number: string;
};

// Available statuses for updating
const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders.");
    } else {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update Status Logic
  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    const loadingToastId = toast.loading(`Updating Order #${orderId} status to ${newStatus}...`);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status.", { id: loadingToastId });
      console.error(error);
    } else {
      toast.success(`Order #${orderId} updated to ${newStatus}`, { id: loadingToastId });
      // Update UI optimistically
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    }
  };

  const filteredOrders = orders.filter(order => 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-12 px-4 selection:bg-blue-600 selection:text-white">
      {/* Background Noise */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link href="/admin/dashboard" className="flex items-center text-gray-400 hover:text-white transition-colors mb-2 text-sm uppercase tracking-widest font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Order Manager
            </h1>
          </div>
          <p className="text-gray-500 font-medium text-lg uppercase tracking-widest hidden md:block">
            {orders.length} Total Orders
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Customer Name or Order ID..."
            className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-600 transition-colors placeholder-gray-600 shadow-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Order Table */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                    <th className="p-6">Order ID</th>
                    <th className="p-6">Customer</th>
                    <th className="p-6">Total</th>
                    <th className="p-6">Date</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                      {/* Order ID (Now a clickable link) */}
                      <td className="p-6">
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm text-blue-400 hover:underline">
                           #{order.id}
                        </Link>
                      </td>
                      
                      {/* Customer */}
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-bold text-white line-clamp-1">{order.customer_name}</span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="p-6 font-mono font-bold text-white">${order.total_amount.toFixed(2)}</td>
                      
                      {/* Date */}
                      <td className="p-6 text-sm text-gray-400 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-6">
                        <StatusSelector currentStatus={order.status} onUpdate={(status) => handleStatusUpdate(order.id, status)} />
                      </td>

                      {/* Actions */}
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-3">
                           {/* View Details Link */}
                           <Link href={`/admin/orders/${order.id}`} className="p-2 bg-white/10 hover:bg-blue-600 text-gray-400 hover:text-white rounded-lg transition-colors" title="View Details">
                             <Package className="w-4 h-4" />
                           </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-16 text-center">
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

// --- HELPER COMPONENTS ---

// Component for Status Dropdown
const StatusSelector = ({ currentStatus, onUpdate }: { currentStatus: string, onUpdate: (status: string) => void }) => {
    
    const statusColor = (status: string) => {
        if (status === 'Delivered') return 'text-green-400 bg-green-900/20 border-green-500/30';
        if (status === 'Shipped') return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
        if (status === 'Cancelled') return 'text-red-400 bg-red-900/20 border-red-500/30';
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'; // Processing
    }

    return (
        <select
            value={currentStatus}
            onChange={(e) => onUpdate(e.target.value)}
            className={`w-full appearance-none cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md border focus:ring-1 focus:ring-white/50 ${statusColor(currentStatus)}`}
            style={{ minWidth: '120px', backgroundColor: 'transparent' }} // Ensures theme visibility
        >
            {ORDER_STATUSES.map(status => (
                <option key={status} value={status} className="bg-zinc-900 text-white">
                    {status}
                </option>
            ))}
        </select>
    );
};