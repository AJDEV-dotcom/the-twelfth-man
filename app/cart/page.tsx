"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useCart, CartItem } from "@/context/CartContext";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, ShieldCheck, X, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Lenis from "lenis"; // Import Lenis

// --- QUICK VIEW MODAL COMPONENT ---
function QuickViewModal({ item, onClose }: { item: CartItem; onClose: () => void }) {
  const [productImages, setProductImages] = useState<string[]>([item.image_url]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch full product details (images & description)
  useEffect(() => {
    async function fetchDetails() {
      const { data, error } = await supabase
        .from("products")
        .select("image_urls, description, category")
        .eq("id", item.id)
        .single();

      if (!error && data) {
        if (data.image_urls && data.image_urls.length > 0) {
          setProductImages(data.image_urls);
        }
      }
      setLoading(false);
    }
    fetchDetails();
  }, [item.id]);

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-900 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden relative flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white hover:bg-white hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left: Image Gallery */}
        <div className="relative w-full md:w-1/2 bg-black aspect-square md:aspect-auto md:h-auto flex items-center justify-center overflow-hidden">
          <Image
            src={productImages[activeImageIndex]}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          
          {/* Navigation Arrows */}
          {productImages.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${i === activeImageIndex ? "bg-white w-4" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto">
          <div className="mb-auto">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight mb-2">{item.name}</h2>
            <p className="text-xl font-bold text-blue-500 mb-6">${item.price}</p>
            
            <div className="space-y-4 text-sm text-gray-400 border-t border-white/10 pt-6">
               <div className="flex justify-between">
                 <span>Selected Size</span>
                 <span className="text-white font-bold">{item.size || "N/A"}</span>
               </div>
               <div className="flex justify-between">
                 <span>Quantity</span>
                 <span className="text-white font-bold">{item.quantity}</span>
               </div>
               <div className="flex justify-between border-t border-white/10 pt-4 mt-4">
                 <span>Subtotal</span>
                 <span className="text-white font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</span>
               </div>
            </div>
          </div>
          
          <Link 
            href={`/product/${item.id}`} 
            className="mt-8 w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-center rounded-xl hover:bg-blue-600 hover:text-white transition-all"
          >
            View Full Details
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null); // For Modal
  const shippingCost = cartTotal > 150 ? 0 : 15;
  const lenisRef = useRef<Lenis | null>(null);

  // --- SMOOTH SCROLL SETUP (Lenis) ---
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      if (lenisRef.current) lenisRef.current.stop(); // Stop Lenis
      document.body.style.overflow = "hidden";
    } else {
      if (lenisRef.current) lenisRef.current.start(); // Start Lenis
      document.body.style.overflow = "";
    }
  }, [selectedItem]);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-20 flex flex-col items-center justify-center px-6">
        <div className="bg-zinc-900/50 p-8 rounded-full mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-center">Your Locker is Empty</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Looks like you haven't added any gear yet. Explore our latest drops and get match-ready.
        </p>
        <Link 
          href="/shop/all" 
          className="bg-white text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-32 lg:pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-8 md:mb-12">
          Your <span className="text-blue-600">Locker</span> 
          <span className="text-base text-gray-500 font-normal ml-2">
            ({cartItems.length}{" "}{cartItems.length === 1 ? 'Item' : 'Items'})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* LEFT: CART ITEMS LIST */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div 
                  key={`${item.id}-${item.size}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  onClick={() => setSelectedItem(item)}
                  className="flex gap-4 bg-zinc-900/50 border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl group cursor-pointer hover:border-white/20 transition-all"
                >
                  {/* Image */}
                  <div className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 bg-zinc-800 rounded-lg overflow-hidden">
                    <Image 
                      src={item.image_url} 
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm md:text-xl leading-tight mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-xs md:text-sm text-gray-400 uppercase tracking-wide font-bold mb-2">
                          Size: <span className="text-white">{item.size || "N/A"}</span>
                        </p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.id, item.size); }}
                        className="text-gray-500 hover:text-red-500 transition-colors p-2 -mt-2 -mr-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-end">
                      {/* Quantity Control */}
                      <div className="flex items-center border border-white/10 rounded-lg bg-black/50 h-8 md:h-10" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, -1)}
                          className="w-8 md:w-10 h-full flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 md:w-8 text-center text-xs md:text-sm font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, 1)}
                          className="w-8 md:w-10 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg md:text-xl font-bold font-mono text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                           <p className="text-[10px] text-gray-500">${item.price} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* RIGHT: SUMMARY (Desktop) / HIDDEN ON MOBILE (See Sticky Footer) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 sticky top-32">
              <h2 className="text-xl font-black uppercase tracking-wider mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal</span>
                  <span className="text-white font-mono">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Shipping {shippingCost === 0 && <span className="text-green-500 text-xs font-bold ml-2">(FREE)</span>}</span>
                  <span className="text-white font-mono">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-500 font-mono text-xl">${(cartTotal + shippingCost).toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group shadow-lg shadow-white/5">
                Checkout <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4" />
                Secure Checkout
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY FOOTER (Myntra Style) */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/10 p-4 lg:hidden z-40 safe-area-pb">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <div className="flex-1">
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total</p>
             <p className="text-xl font-black text-white font-mono leading-none">
               ${(cartTotal + shippingCost).toFixed(2)}
             </p>
          </div>
          <button className="flex-1 bg-white text-black py-3.5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors shadow-lg">
            Place Order
          </button>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <QuickViewModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}