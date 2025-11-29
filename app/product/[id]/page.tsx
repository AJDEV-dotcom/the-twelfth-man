"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Star, Minus, Plus, ChevronDown, CreditCard, RefreshCw, Ruler, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Lenis from "lenis";

// --- TYPES ---
type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  image_urls?: string[];
  category: string;
  description: string;
  subcategory?: string;
};

// --- ACCORDION COMPONENT ---
function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="text-sm font-bold uppercase tracking-widest text-white group-hover:text-blue-500 transition-colors">
          {title}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-gray-400 leading-7 text-sm font-medium">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>("M");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Full Screen & Zoom State
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const lenisRef = useRef<Lenis | null>(null);

  // Standard sizes
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

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

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url, 
        quantity: quantity,
      }); 
      
      setIsAdding(false);
      alert("Added to cart!");
    }, 600);
  };

  // --- FULL SCREEN HANDLERS ---
  const openFullScreen = (img: string) => {
    setFullScreenImage(img);
    setZoomLevel(1);
    if (lenisRef.current) lenisRef.current.stop();
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
    setZoomLevel(1);
    if (lenisRef.current) lenisRef.current.start();
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => {
      const newZoom = prev + delta;
      return Math.max(1, Math.min(4, newZoom));
    });
  };

  // --- SMART IMAGE LOGIC ---
  const images = (product?.image_urls && product.image_urls.length > 0)
    ? product.image_urls 
    : (product?.image_url ? [product.image_url] : ["https://via.placeholder.com/600"]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-xs font-bold uppercase tracking-widest">Loading Kit...</p>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <h1 className="text-2xl font-bold">Product Not Found</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white pt-28 pb-20">
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* --- FULL SCREEN IMAGE MODAL --- */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center overflow-hidden"
          >
            <button 
              onClick={closeFullScreen}
              className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
              <motion.img
                src={fullScreenImage}
                alt="Full Screen View"
                className="max-h-screen max-w-full object-contain"
                animate={{ scale: zoomLevel }}
                drag={zoomLevel > 1}
                dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                dragElastic={0.1}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-zinc-900/90 border border-white/10 px-6 py-3 rounded-full shadow-2xl backdrop-blur-lg">
              <button onClick={() => handleZoom(-0.5)} className="text-gray-400 hover:text-white transition-colors">
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold w-12 text-center select-none">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => handleZoom(0.5)} className="text-gray-400 hover:text-white transition-colors">
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-4 bg-white/20 mx-2" />
              <button 
                onClick={() => setZoomLevel(1)} 
                className="text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[90rem] mx-auto px-6 relative z-10">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-8 md:mb-12">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/shop/${product.category.replace(/ /g, "-")}`} className="hover:text-white transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-white line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* --- LEFT: GALLERY --- 
              Mobile: Horizontal Scroll / Desktop: Vertical Stack
          */}
          <div className="lg:col-span-7 flex flex-row lg:flex-col gap-2 lg:gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
            {images.map((img, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative w-full flex-shrink-0 lg:flex-shrink bg-zinc-900 rounded-lg overflow-hidden group snap-center"
              >
                <div className="aspect-[4/5] relative">
                  <img 
                    src={img} 
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* EXPAND BUTTON (Desktop Only) */}
                  <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block">
                    <button 
                      onClick={() => openFullScreen(img)}
                      className="bg-black/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-blue-600 transition-colors shadow-lg border border-white/10"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* EXPAND BUTTON (Mobile - Always visible but subtle) */}
                  <div className="absolute top-4 right-4 z-20 lg:hidden">
                    <button 
                      onClick={() => openFullScreen(img)}
                      className="bg-black/30 backdrop-blur-md p-2 rounded-full text-white/80"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {index === 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest">
                      {product.subcategory || "Official Kit"}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* --- RIGHT: DETAILS (5 Cols) - STICKY --- */}
          <div className="lg:col-span-5 relative h-full">
            <div className="sticky top-32 h-fit">
              
              {/* Header Info */}
              <div className="mb-6">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
                  {product.name}
                </h1>
                
                <div className="flex flex-wrap items-end gap-4 mb-6">
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    ${product.price}
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold text-gray-400 ml-2">(24 Reviews)</span>
                  </div>
                </div>

                {/* Offer Banner */}
                <div className="bg-blue-900/20 border border-blue-500/20 p-4 mb-8">
                  <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Flash Sale Live</p>
                  <p className="text-sm text-gray-300">
                    Use code <span className="text-white font-mono font-bold bg-white/10 px-1 mx-1">12THMAN</span> for extra 15% off.
                  </p>
                </div>
              </div>

              {/* Selectors */}
              <div className="space-y-8 mb-8 border-t border-white/10 pt-8">
                
                {/* Size */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Size: <span className="text-white ml-2">{selectedSize}</span></label>
                    <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-white hover:text-blue-500 transition-colors">
                      <Ruler className="w-3 h-3" /> Size Chart
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3.5rem] h-12 px-4 flex items-center justify-center text-sm font-bold border transition-all ${
                          selectedSize === size
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-gray-500 border-zinc-800 hover:border-gray-500 hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">Quantity</label>
                  <div className="flex items-center w-32 border border-zinc-800 h-12 bg-black">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="flex-1 text-center font-bold text-sm">{quantity}</div>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mb-10">
                <button 
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-transparent border border-white text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group"
                >
                  {isAdding ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (
                    <>
                      Add to Cart <ShoppingBag className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
                <button 
                  className="w-full py-4 bg-blue-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
                >
                  Buy It Now
                </button>
              </div>

              {/* Collapsible Info Sections */}
              <div className="border-t border-white/10">
                <Accordion title="Material & Care" defaultOpen={true}>
                  <div className="space-y-2">
                    <p><strong>Composition:</strong> 100% Recycled Polyester.</p>
                    <p><strong>Technology:</strong> Moisture-wicking Dri-FIT fabric keeps you cool.</p>
                    <p><strong>Care:</strong> Machine wash cold. Do not bleach. Tumble dry low.</p>
                  </div>
                </Accordion>
                
                <Accordion title="Description">
                  <p className="mb-4">{product.description || "Represent your colors with pride. This authentic jersey features the same technology worn by the pros on the pitch."}</p>
                  <p>Designed for the ultimate fan, offering a comfortable fit for the stands or the street.</p>
                </Accordion>

                <Accordion title="Returns & Shipping">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2"><Truck className="w-4 h-4 text-blue-500" /> Free Shipping on orders over $150.</p>
                    <p className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-blue-500" /> 30-Day Hassle-Free Returns.</p>
                  </div>
                </Accordion>
              </div>

              {/* Trust Footer */}
              <div className="mt-8 pt-6 flex items-center justify-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase">Secure</span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase">Fast Ship</span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="flex flex-col items-center gap-1">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase">Verified</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}