"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShoppingBag, MapPin, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { CartItem } from "@/context/CartContext";

// --- FORM DATA TYPE ---
type ShippingData = {
  customer_name: string;
  customer_email: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingData>({
    customer_name: user?.user_metadata?.full_name || "",
    customer_email: user?.email || "",
    phone_number: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "India",
  });
  
  const shippingCost = cartTotal > 150 ? 0 : 15;
  const totalAmount = cartTotal + shippingCost;

  // Redirect to cart if empty
  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      router.push("/cart");
    }
  }, [cartItems, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  // --- SUBMIT ORDER LOGIC ---
  const handleOrderSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToastId = toast.loading("Processing Mock Payment...");

    // 1. Prepare Order Header Data
    const orderHeader = {
      user_id: user?.id,
      order_total: cartTotal,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      status: 'Processing',
      payment_method: 'Mock Payment',
      ...shippingData,
    };

    try {
      // 2. Insert into orders table
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderHeader)
        .select('id')
        .single();

      if (orderError || !orderResult) throw new Error(orderError?.message || "Failed to create order header.");

      const orderId = orderResult.id;

      // 3. Prepare Order Details (Items)
      const orderDetails = cartItems.map((item: CartItem) => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        size: item.size,
      }));

      // 4. Insert into order_details table
      const { error: detailsError } = await supabase
        .from('order_details')
        .insert(orderDetails);

      if (detailsError) throw new Error(detailsError.message || "Failed to insert order details.");

      // 5. Clear Cart (Both Local and DB)
      await clearCart(); 

      // --- SUCCESS: REDIRECT IS THE LAST THING THAT HAPPENS ---
      toast.success("Payment Successful! Order Confirmed.", { id: loadingToastId });
      
      // FIXED: Use setTimeout to ensure execution stack is clear before router push,
      // resolving the silent redirect failure/race condition.
      setTimeout(() => {
        router.push(`/checkout/success?orderId=${orderId}`);
      }, 50); 

    } catch (error: any) {
      console.error("Checkout Failed due to:", error); // Explicit logging
      // If the error is the RLS violation, the error message will appear
      toast.error(error.message || "Checkout failed. Please try again.", { id: loadingToastId });
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) return null; // Avoid rendering empty page while redirecting

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white pt-32 pb-20 relative">
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <Link href="/cart" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors group text-sm uppercase tracking-widest font-bold">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Cart
        </Link>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">
          Secure <span className="text-blue-600">Checkout</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT: SHIPPING FORM (LG COL 7) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-zinc-900/50 border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl"
          >
            <h2 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-500" /> Shipping Information
            </h2>
            
            <form onSubmit={handleOrderSubmission} className="space-y-6">
              
              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input name="customer_name" label="Full Name" value={shippingData.customer_name} onChange={handleInputChange} required />
                <Input name="customer_email" label="Email Address" type="email" value={shippingData.customer_email} onChange={handleInputChange} required readOnly={!!user} />
              </div>

              {/* Phone & Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input name="phone_number" label="Phone Number" type="tel" pattern="[0-9]{10}" title="Must be 10 digits" value={shippingData.phone_number} onChange={handleInputChange} required />
                <Select name="country" label="Country" value={shippingData.country} onChange={handleInputChange} options={["India", "United States", "United Kingdom"]} required />
              </div>

              {/* Address Line 1 & 2 */}
              <Input name="address_line_1" label="Address Line 1" placeholder="Street Address, House No." value={shippingData.address_line_1} onChange={handleInputChange} required />
              <Input name="address_line_2" label="Address Line 2 (Optional)" placeholder="Apartment, Suite, etc." value={shippingData.address_line_2} onChange={handleInputChange} />

              {/* City, State, Zip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input name="city" label="City" value={shippingData.city} onChange={handleInputChange} required />
                <Input name="state" label="State/Province" value={shippingData.state} onChange={handleInputChange} required />
                <Input name="zip_code" label="ZIP/Postal Code" value={shippingData.zip_code} onChange={handleInputChange} required />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0}
                  className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-5 rounded-xl hover:bg-blue-700 transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Pay & Place Order (${totalAmount.toFixed(2)}) <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>

          {/* RIGHT: ORDER SUMMARY (LG COL 5) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 sticky top-32"
          >
            <h2 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-blue-500" /> Order Review ({cartItems.length})
            </h2>

            {/* Item List */}
            <div className="max-h-60 overflow-y-auto space-y-4 pr-2 border-b border-white/10 pb-4 mb-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {/* Next/Image usage requires sizes prop */}
                  <div className="relative w-12 h-16 flex-shrink-0">
                      <Image src={item.image_url} alt={item.name} fill sizes="48px" className="rounded-md object-cover flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold truncate text-white">{item.name}</p>
                    <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity} / Size: {item.size}</p>
                  </div>
                  <p className="font-mono text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pt-2 mb-6">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="text-white font-mono">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping Fee</span>
                <span className="text-white font-mono">{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex justify-between text-xl font-black uppercase">
                <span>Total Due</span>
                <span className="text-blue-500 font-mono">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              By placing this order, you agree to our Terms & Conditions.
            </p>

          </motion.div>

        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function Input({ name, label, value, onChange, required = false, type = 'text', placeholder, pattern, title, readOnly = false }: { 
  name: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, required?: boolean, type?: string, placeholder?: string, pattern?: string, title?: string, readOnly?: boolean
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        pattern={pattern}
        title={title}
        className={`w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-600 transition-all font-medium ${readOnly ? 'opacity-70 cursor-default' : ''}`}
      />
    </div>
  );
}

function Select({ name, label, value, onChange, options, required }: { 
  name: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, options: string[], required: boolean
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-600 transition-all font-medium appearance-none cursor-pointer"
        >
          {options.map(option => (
            <option key={option} value={option} className="bg-zinc-900">{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
}