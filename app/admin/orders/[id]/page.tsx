"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, User, MapPin, DollarSign, Calendar, Truck, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

type OrderDetail = {
  product_name: string;
  unit_price: number;
  quantity: number;
  size: string | null;
};

// FULL Order Data Type (Includes all necessary fields for the summary)
type Order = {
  id: number;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string | null; // Fixed: Included optional field
  city: string;
  state: string;
  zip_code: string;
  country: string;
  
  // Financial Fields (Fixed: Included missing properties)
  order_total: number; 
  shipping_cost: number;
  total_amount: number;
  status: string;
  payment_method: string; 
  
  created_at: string;
};


export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const orderId = Number(id);

  const [order, setOrder] = useState<Order | null>(null);
  const [details, setDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderData() {
      setLoading(true);
      if (!orderId) {
        setLoading(false);
        return;
      }

      // Fetch Order Header
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      // Fetch Order Details (Items)
      const { data: detailsData, error: detailsError } = await supabase
        .from("order_details")
        .select("product_name, unit_price, quantity, size")
        .eq("order_id", orderId);

      if (orderError || detailsError || !orderData || !detailsData) {
        console.error("Error fetching order details:", orderError || detailsError);
        toast.error(`Order #${orderId} not found.`);
      } else {
        setOrder(orderData as Order);
        setDetails(detailsData as OrderDetail[]);
      }
      setLoading(false);
    }
    fetchOrderData();
  }, [orderId]);
  
  const statusColor = (status: string) => {
    if (status === 'Delivered') return 'text-green-400 bg-green-900/20 border-green-500/30';
    if (status === 'Shipped') return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    if (status === 'Cancelled') return 'text-red-400 bg-red-900/20 border-red-500/30';
    return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'; // Processing (Default)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-32">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center pt-32">
        <h1 className="text-4xl font-black uppercase mb-4">Order Not Found</h1>
        <Link href="/admin/orders" className="text-blue-500 hover:underline">Return to Order Manager</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-12 px-4 selection:bg-blue-600 selection:text-white">
      {/* Background Noise */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/admin/orders" className="flex items-center text-gray-400 hover:text-white transition-colors mb-2 text-sm uppercase tracking-widest font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Link>
          <div className="text-right">
             <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
               Order <span className="text-blue-600">#{order.id}</span>
             </h1>
             <p className={`text-xs font-bold mt-2 px-3 py-1 rounded-full ${statusColor(order.status)} inline-block`}>
                {order.status}
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: ITEMS & FINANCIALS (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">

                {/* ITEMS LIST */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-blue-500" /> Items Purchased ({details.length})
                    </h2>
                    <div className="space-y-4">
                        {details.map((item, index) => (
                            <div key={index} className="flex justify-between items-start text-sm border-b border-white/5 pb-3">
                                <div className="max-w-[70%]">
                                    <p className="font-bold text-white line-clamp-1">{item.product_name}</p>
                                    <p className="text-gray-500 text-xs mt-1">Size: {item.size || 'N/A'} &bull; Qty: {item.quantity}</p>
                                </div>
                                <span className="font-mono text-white font-bold text-lg">${(item.unit_price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FINANCIAL SUMMARY */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-yellow-500" /> Financial Summary
                    </h2>
                    <div className="space-y-3 font-mono text-sm">
                        <FinancialRow label="Subtotal" value={order.order_total} />
                        <FinancialRow label="Shipping" value={order.shipping_cost} isFree={order.shipping_cost === 0} />
                        <div className="h-px bg-white/10 my-3" />
                        <FinancialRow label="TOTAL PAID" value={order.total_amount} isTotal={true} />
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: CUSTOMER & ADDRESS (1/3 width) */}
            <div className="lg:col-span-1 space-y-8">

                {/* CUSTOMER INFO */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 className="text-lg font-black uppercase tracking-wider mb-4 flex items-center gap-3 text-blue-400">
                        <User className="w-4 h-4" /> Customer
                    </h2>
                    <DetailRow label="Name" value={order.customer_name} />
                    <DetailRow label="Email" value={order.customer_email} />
                    <DetailRow label="Phone" value={order.phone_number} />
                </div>

                {/* SHIPPING ADDRESS */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 className="text-lg font-black uppercase tracking-wider mb-4 flex items-center gap-3 text-blue-400">
                        <MapPin className="w-4 h-4" /> Shipping Address
                    </h2>
                    <p className="text-sm text-gray-300 font-medium leading-relaxed">
                        {order.address_line_1}
                        {order.address_line_2 && <>, {order.address_line_2}</>}
                        <br />
                        {order.city}, {order.state}
                        <br />
                        {order.zip_code}, {order.country}
                    </p>
                </div>

                {/* ORDER METADATA */}
                 <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 className="text-lg font-black uppercase tracking-wider mb-4 flex items-center gap-3 text-blue-400">
                        <Calendar className="w-4 h-4" /> Metadata
                    </h2>
                    <DetailRow label="Date" value={new Date(order.created_at).toLocaleString()} />
                    <DetailRow label="Payment" value={order.payment_method} />
                    <DetailRow label="User ID" value={order.user_id ? order.user_id.substring(0, 8) + '...' : 'Guest'} />
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

const DetailRow = ({ label, value }: { label: string, value: string | null }) => (
    <div className="flex justify-between items-start py-2 border-t border-white/5">
        <span className="text-gray-500 text-xs uppercase tracking-widest">{label}</span>
        <span className="text-white text-sm font-medium text-right max-w-[60%]">{value || 'N/A'}</span>
    </div>
);

const FinancialRow = ({ label, value, isTotal = false, isFree = false }: { label: string, value: number, isTotal?: boolean, isFree?: boolean }) => (
    <div className={`flex justify-between items-center ${isTotal ? 'text-xl font-black text-blue-500 pt-3' : 'text-sm text-gray-400'}`}>
        <span className={`${isTotal ? 'uppercase' : 'font-medium'}`}>{label}</span>
        <span className={`${isTotal ? 'text-2xl font-mono' : 'font-mono'} ${isFree ? 'text-green-500' : 'text-white'}`}>
            {isFree ? 'FREE' : `$${value.toFixed(2)}`}
        </span>
    </div>
);