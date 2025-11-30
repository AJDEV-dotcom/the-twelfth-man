"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Home, ShoppingBag, MapPin, Loader2, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type OrderItem = {
    product_name: string;
    unit_price: number;
    quantity: number;
    size: string | null;
};

type OrderData = {
    id: number;
    total_amount: number;
    shipping_cost: number;
    order_total: number;
    customer_name: string;
    customer_email: string;
    address_line_1: string;
    address_line_2: string | null; // FIXED: Added missing property
    city: string;
    zip_code: string;
    created_at: string;
    order_details: OrderItem[];
};

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!orderId) {
            setError(true);
            setLoading(false);
            return;
        }

        async function fetchOrderDetails() {
            setLoading(true);
            
            // Fetch Order Header
            const { data: headerData, error: headerError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            // Fetch Order Details (Items)
            const { data: detailsData, error: detailsError } = await supabase
                .from('order_details')
                .select('product_name, unit_price, quantity, size')
                .eq('order_id', orderId);

            if (headerError || detailsError || !headerData || !detailsData) {
                console.error("Error fetching order:", headerError || detailsError);
                toast.error("Failed to retrieve order details.");
                setError(true);
            } else {
                setOrderData({
                    ...headerData,
                    order_details: detailsData,
                } as OrderData);
            }
            setLoading(false);
        }

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center pt-32">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-6 pt-32">
                <h1 className="text-4xl font-black uppercase mb-4 text-red-500">Error!</h1>
                <p className="text-gray-400 mb-8 max-w-md">
                    Order details could not be found or the order ID is invalid. Please check your email for confirmation.
                </p>
                <Link href="/" className="bg-white text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                    <Home className="w-5 h-5" /> Go to Home
                </Link>
            </div>
        );
    }

    // Format Date for readability
    const orderDate = new Date(orderData.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-black text-white pt-32 pb-20 relative"
        >
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
            
            <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">
                
                {/* CHECKMARK HEADER */}
                <div className="text-center mb-12 border-b border-white/10 pb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-600"
                    >
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-2">
                        Order <span className="text-green-500">Confirmed!</span>
                    </h1>
                    <p className="text-gray-400 font-medium text-lg uppercase tracking-widest">
                        Thank you for joining the team.
                    </p>
                </div>

                {/* ORDER DETAILS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    
                    {/* LEFT: Order Info */}
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-black uppercase tracking-widest text-blue-500 border-b border-white/10 pb-3 mb-3">
                            Order Summary
                        </h2>
                        <DetailItem icon={<ShoppingBag className="w-4 h-4" />} label="Order #" value={`#${orderData.id}`} />
                        <DetailItem icon={<MapPin className="w-4 h-4" />} label="Order Date" value={orderDate} />
                        <DetailItem icon={<DollarSign className="w-4 h-4" />} label="Total Paid" value={`$${orderData.total_amount.toFixed(2)}`} />
                        <DetailItem icon={<MapPin className="w-4 h-4" />} label="Status" value="Processing" />
                    </div>

                    {/* RIGHT: Shipping Address */}
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-black uppercase tracking-widest text-blue-500 border-b border-white/10 pb-3 mb-3">
                            Shipping Details
                        </h2>
                        <DetailItem label="Recipient" value={orderData.customer_name} />
                        <DetailItem label="Email" value={orderData.customer_email} />
                        <DetailItem label="Address" value={`${orderData.address_line_1}${orderData.address_line_2 ? ', ' + orderData.address_line_2 : ''}`} />
                        <DetailItem label="City / ZIP" value={`${orderData.city}, ${orderData.zip_code}`} />
                    </div>
                </div>

                {/* ITEMS PURCHASED LIST */}
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-black uppercase tracking-widest text-blue-500 border-b border-white/10 pb-3 mb-4">
                        Items Purchased
                    </h2>
                    <div className="space-y-3">
                        {orderData.order_details.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <p className="font-bold text-white max-w-[60%] truncate">{item.product_name}</p>
                                <div className="text-right">
                                    <span className="text-gray-400 font-medium mr-4">{item.quantity} x {item.size}</span>
                                    <span className="font-mono text-white font-bold">${(item.unit_price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA FOOTER */}
                <div className="text-center mt-12">
                    <p className="text-gray-500 text-sm mb-6">
                        A full receipt has been sent to **{orderData.customer_email}**.
                    </p>
                    <Link href="/shop/all" className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 mx-auto max-w-sm">
                        Continue Shopping <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

            </div>
        </motion.div>
    );
}

// Helper component for detail rows
function DetailItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-medium flex items-center gap-2">
                {icon}
                {label}
            </span>
            <span className="text-white font-bold max-w-[50%] truncate">{value}</span>
        </div>
    );
}