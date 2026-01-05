"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Star, Minus, Plus, ChevronDown, CreditCard, RefreshCw, Ruler, Maximize2, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Scan } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Lenis from "lenis";
import toast from "react-hot-toast"; // Import Toast

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
  size_type?: string; 
};

// --- SIZE CONFIGURATION ---
const SIZE_CONFIG: Record<string, string[]> = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  footwear: ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11"],
  gloves: ["Size 7", "Size 8", "Size 9", "Size 10", "Size 11"],
  balls: ["Size 4", "Size 5"],
  equipment: ["One Size"],
};

// --- SIZE CHARTS DATA ---
const SIZE_CHARTS: Record<string, { label: string; value: string }[]> = {
  apparel: [
    { label: "S", value: "Chest: 36-38\"" },
    { label: "M", value: "Chest: 38-40\"" },
    { label: "L", value: "Chest: 40-42\"" },
    { label: "XL", value: "Chest: 42-44\"" },
  ],
  footwear: [
    { label: "US 8", value: "EU 41 / UK 7" },
    { label: "US 9", value: "EU 42.5 / UK 8" },
    { label: "US 10", value: "EU 44 / UK 9" },
    { label: "US 11", value: "EU 45 / UK 10" },
  ],
  gloves: [
    { label: "Size 8", value: "Hand Width: 80-85mm" },
    { label: "Size 9", value: "Hand Width: 85-90mm" },
    { label: "Size 10", value: "Hand Width: 90-95mm" },
  ],
  balls: [
    { label: "Size 5", value: "Standard Match Ball (Ages 12+)" },
    { label: "Size 4", value: "Youth Training (Ages 8-12)" },
  ],
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // UI States
  const [fullScreenIndex, setFullScreenIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false); 

  const lenisRef = useRef<Lenis | null>(null);

  // --- SMOOTH SCROLL SETUP ---
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

  // --- FETCH PRODUCT ---
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
        const type = determineSizeType(data.category, data.subcategory);
        if (type === 'equipment') setSelectedSize("One Size");
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  // --- KEYBOARD NAVIGATION FOR GALLERY ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullScreenIndex === null) return;
      if (e.key === "ArrowRight") handleNavigate(1);
      if (e.key === "ArrowLeft") handleNavigate(-1);
      if (e.key === "Escape") closeFullScreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullScreenIndex]);

  const determineSizeType = (category: string, subcategory?: string) => {
    const cat = category.toLowerCase();
    const sub = subcategory?.toLowerCase() || "";
    
    if (cat === "boots") return "footwear";
    if (cat === "goalkeeper") return "gloves";
    if (cat === "footballs") return "balls";
    if (sub.includes("sock")) return "footwear";
    if (sub.includes("shin") || sub.includes("guard")) return "apparel";
    if (cat === "training gear") return "equipment"; 
    if (cat === "accessories") return "equipment";
    if (cat.includes("boot") || cat.includes("shoe")) return "footwear";
    if (cat.includes("glove")) return "gloves";
    if (cat.includes("ball")) return "balls";
    
    return "apparel";
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check Size
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }

    setIsAdding(true);
    
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url, 
        quantity: quantity,
        size: selectedSize, // FIXED: Now passing the selected size to the cart
      }); 
      
      setIsAdding(false);
      
      // Custom Success Toast with Icon
      toast.success("Added to your locker!", {
        icon: <ShoppingBag className="w-5 h-5 text-green-500" />,
        duration: 3000,
      });
    }, 600);
  };

  // --- IMAGE LOGIC ---
  const images = (product?.image_urls && product.image_urls.length > 0)
    ? product.image_urls 
    : (product?.image_url ? [product.image_url] : ["https://via.placeholder.com/600"]);

  // --- FULL SCREEN HANDLERS ---
  const openFullScreen = (index: number) => {
    setFullScreenIndex(index);
    setZoomLevel(1);
    if (lenisRef.current) lenisRef.current.stop();
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  };

  const closeFullScreen = () => {
    setFullScreenIndex(null);
    setZoomLevel(1);
    if (lenisRef.current) lenisRef.current.start();
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  };

  const handleNavigate = (direction: number) => {
    if (fullScreenIndex === null) return;
    setZoomLevel(1); // Reset zoom on slide
    const newIndex = (fullScreenIndex + direction + images.length) % images.length;
    setFullScreenIndex(newIndex);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => {
      const newZoom = prev + delta;
      return Math.max(1, Math.min(4, newZoom));
    });
  };

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

  if (!product) return null;

  const sizeType = determineSizeType(product.category, product.subcategory);
  const currentSizes = SIZE_CONFIG[sizeType];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white pt-28 pb-20">
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* --- SIZE CHART MODAL --- */}
      <AnimatePresence>
        {showSizeChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSizeChart(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowSizeChart(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-black uppercase tracking-wider mb-6 text-white">
                Size Guide ({sizeType.toUpperCase()})
              </h3>
              <div className="space-y-3">
                {SIZE_CHARTS[sizeType]?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-bold text-white">{item.label}</span>
                    <span className="text-gray-400 text-sm">{item.value}</span>
                  </div>
                )) || <p className="text-gray-400">No specific chart for this item.</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FULL SCREEN IMAGE MODAL --- */}
      <AnimatePresence>
        {fullScreenIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={closeFullScreen}
              className="absolute top-6 right-6 z-50 p-3 bg-white/5 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows (Hidden on Mobile) */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => handleNavigate(-1)}
                  className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/5 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={() => handleNavigate(1)}
                  className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/5 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image Viewer */}
            <div className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
              <AnimatePresence mode="wait">
                <motion.img
                  key={fullScreenIndex}
                  src={images[fullScreenIndex]}
                  alt="Full Screen View"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: zoomLevel }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-screen max-w-full object-contain"
                  drag={zoomLevel > 1}
                  dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                  dragElastic={0.1}
                />
              </AnimatePresence>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-zinc-900/90 border border-white/10 px-8 py-4 rounded-full shadow-2xl backdrop-blur-lg">
              <button onClick={() => handleZoom(-0.5)} className="text-gray-400 hover:text-white transition-colors">
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold w-12 text-center select-none text-white">{Math.round(zoomLevel * 100)}%</span>
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
          
          {/* --- LEFT: GALLERY --- */}
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
                  
                  {/* EXPAND BUTTON (Desktop) */}
                  <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block">
                    <button 
                      onClick={() => openFullScreen(index)}
                      className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:bg-white hover:text-black transition-all shadow-lg border border-white/10"
                      title="Expand View"
                    >
                      <Scan className="w-5 h-5" />
                    </button>
                  </div>

                  {/* EXPAND BUTTON (Mobile) */}
                  <div className="absolute top-4 right-4 z-20 lg:hidden">
                    <button 
                      onClick={() => openFullScreen(index)}
                      className="bg-black/30 backdrop-blur-md p-2 rounded-full text-white/80 hover:bg-white/20 transition-colors"
                    >
                      <Scan className="w-4 h-4" />
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

          {/* --- RIGHT: DETAILS --- */}
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
                
                {/* Size Selector */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Size: <span className="text-white ml-2">{selectedSize}</span></label>
                    {/* Size Chart Trigger */}
                    {sizeType !== 'equipment' && (
                      <button 
                        onClick={() => setShowSizeChart(true)}
                        className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-white hover:text-blue-500 transition-colors"
                      >
                        <Ruler className="w-3 h-3" /> Size Chart
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {currentSizes?.map((size) => (
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
                    )) || <p className="text-red-500">Sizes not loaded properly.</p>}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">Quantity</label>
                  <div className="flex items-center w-32 border border-zinc-800 h-12 bg-black">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-900"><Minus className="w-3 h-3" /></button>
                    <div className="flex-1 text-center font-bold text-sm">{quantity}</div>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-900"><Plus className="w-3 h-3" /></button>
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
                <button className="w-full py-4 bg-blue-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
                  Buy It Now
                </button>
              </div>

              {/* Collapsible Info */}
              <div className="border-t border-white/10">
                <Accordion title="Material & Care" defaultOpen={true}>
                  <p>Premium quality materials tailored for athletes.</p>
                </Accordion>
                <Accordion title="Description">
                  <p>{product.description}</p>
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