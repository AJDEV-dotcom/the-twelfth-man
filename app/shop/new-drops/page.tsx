"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, ShoppingBag, Zap, Flame, Filter, ArrowRight, X } from "lucide-react";
import Lenis from "lenis";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

// --- TYPES ---
type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  image_urls?: string[]; 
  category: string;
  subcategory?: string;
  created_at: string; 
};

// --- SIZE CONFIG ---
const SIZE_CONFIG: Record<string, string[]> = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  footwear: ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11"],
  gloves: ["Size 7", "Size 8", "Size 9", "Size 10", "Size 11"],
  balls: ["Size 4", "Size 5"],
  equipment: ["One Size"],
};

// --- CONFIG ---
const CATEGORIES = ["All", "Footballs", "Boots", "Kits & Apparel", "Training Gear", "Accessories", "Goalkeeper"];

// --- PRELOADER COMPONENT ---
function DropsPreloader() {
  const text = "FRESH DROPS";
  const words = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
    exit: {
      y: "-100%", 
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1] as const,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white overflow-hidden"
    >
      <div className="flex gap-3 md:gap-6 overflow-hidden relative px-4 flex-wrap justify-center">
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={item}
            className="text-5xl md:text-8xl font-black tracking-tighter uppercase"
          >
            {word}
          </motion.span>
        ))}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"
        />
      </div>
    </motion.div>
  );
}

export default function NewDropsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  
  const lenisRef = useRef<Lenis | null>(null);

  // --- SMOOTH SCROLL ---
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenisRef.current = lenis;
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // --- FETCH LATEST PRODUCTS ---
  useEffect(() => {
    async function fetchNewDrops() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order('id', { ascending: false }) 
        .limit(50); 

      if (error) {
        console.error("Error:", error);
        toast.error("Failed to load drops");
      } else {
        setProducts(data || []);
      }
      
      setTimeout(() => setLoading(false), 1500);
    }
    fetchNewDrops();
  }, []);

  // Lock Scroll during loading or modal
  useEffect(() => {
    if (loading || showSizeModal) {
      if (lenisRef.current) lenisRef.current.stop();
      if (typeof document !== 'undefined') document.body.style.overflow = "hidden";
    } else {
      if (lenisRef.current) lenisRef.current.start();
      if (typeof document !== 'undefined') document.body.style.overflow = "";
    }
  }, [loading, showSizeModal]);

  // --- DETERMINE SIZE TYPE ---
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

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const type = determineSizeType(product.category, product.subcategory);
    
    // If "One Size", add directly without modal
    if (type === 'equipment') {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1,
        size: "One Size"
      });
      toast.success("Secured in Locker!", { icon: <ShoppingBag className="w-5 h-5 text-blue-500" /> });
      return;
    }

    setSelectedProduct(product);
    setSelectedSize("");
    setShowSizeModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSize) return;
    
    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image_url: selectedProduct.image_url,
      quantity: 1,
      size: selectedSize,
    });
    toast.success("Secured in Locker!", { icon: <ShoppingBag className="w-5 h-5 text-blue-500" /> });
    setShowSizeModal(false);
    setSelectedSize("");
    setSelectedProduct(null);
  };

  // --- GROUPING LOGIC ---
  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const groupedDrops: Record<string, Product[]> = {};
  filteredProducts.forEach(product => {
    const subKey = product.subcategory || "General";
    if (!groupedDrops[subKey]) groupedDrops[subKey] = [];
    if (groupedDrops[subKey].length < 2) { 
      groupedDrops[subKey].push(product);
    }
  });

  // Get current sizes for modal
  const currentSizeType = selectedProduct ? determineSizeType(selectedProduct.category, selectedProduct.subcategory) : "apparel";
  const currentSizes = SIZE_CONFIG[currentSizeType];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white pt-32 pb-20 relative">
      
      {/* NOISE & GRADIENT BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-900/10 blur-[150px] z-0 rounded-full pointer-events-none" />

      {/* PRELOADER */}
      <AnimatePresence mode="wait">
        {loading && <DropsPreloader />}
      </AnimatePresence>

      {/* SIZE SELECTION MODAL */}
      <AnimatePresence>
        {showSizeModal && selectedProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowSizeModal(false);
                setSelectedSize("");
                setSelectedProduct(null);
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] cursor-pointer"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 z-[201] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => {
                  setShowSizeModal(false);
                  setSelectedSize("");
                  setSelectedProduct(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm uppercase tracking-tight line-clamp-2 mb-1">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-blue-400 font-bold text-lg font-mono">${selectedProduct.price}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    Select Size
                  </p>
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest border border-white/5 px-2 py-1 rounded">
                    {currentSizeType}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {currentSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                        selectedSize === size
                          ? "bg-white text-black shadow-lg"
                          : "bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white border border-white/10"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSizeModal(false);
                    setSelectedSize("");
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-sm uppercase tracking-widest transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-all ${
                    selectedSize
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
                      : "bg-zinc-800 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-[90rem] mx-auto px-4 md:px-6 relative z-10">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* --- LEFT COLUMN: CONTENT (SCROLLS) --- */}
          <div className="flex-1 w-full">
            
            {/* HEADER */}
            <div className="mb-16 md:mb-24">
              <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white mb-6 transition-colors text-xs font-bold uppercase tracking-widest group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Return Home
              </Link>
              
              <h1 className="text-5xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter text-white leading-none mb-6">
                Fresh <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Drops.</span>
              </h1>

              {/* MOBILE FILTERS - Show only on mobile, below heading */}
              <div className="lg:hidden">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                  Filter Category
                </p>
                <div className="flex flex-row gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex-shrink-0 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 border ${
                        activeCategory === cat 
                          ? "bg-white text-black shadow-lg border-transparent" 
                          : "text-gray-400 border-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="space-y-24">
                {/* RENDER GROUPS */}
                {Object.entries(groupedDrops).map(([subcat, items]) => (
                  <motion.div 
                    key={subcat}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* SUB-CATEGORY HEADER */}
                    <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                      <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">{subcat}</h2>
                      <span className="ml-auto hidden md:block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full bg-zinc-900">Top Picks</span>
                      {/* Mobile View All Button */}
                      <Link 
                        href={items.length > 0 ? `/shop/${items[0].category.replace(/ /g, "-")}` : '#'}
                        className="ml-auto md:hidden text-[9px] font-bold text-white uppercase tracking-widest border border-white/20 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
                      >
                        View All <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>

                    {/* PRODUCT GRID */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                      {items.map((product, index) => {
                        const mainImage = product.image_url || "https://via.placeholder.com/400";
                        const secondImage = product.image_urls && product.image_urls.length > 1 ? product.image_urls[1] : null;

                        return (
                          <Link 
                            key={`${product.id}-${index}`} 
                            href={`/product/${product.id}`}
                            className="group block relative"
                          >
                            {/* CARD IMAGE */}
                            <div className="relative aspect-[3/4] bg-zinc-900 rounded-xl overflow-hidden mb-4 border border-white/5 group-hover:border-blue-500/50 transition-colors duration-500">
                              
                              {/* "NEW" BADGE */}
                              <div className="absolute top-3 left-3 z-20">
                                <span className="px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-sm shadow-lg">
                                  Just In
                                </span>
                              </div>

                              {/* IMAGE CONTAINER WITH ZOOM */}
                              <motion.div
                                className="w-full h-full"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                              >
                                <Image
                                  src={mainImage}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                
                                {/* HOVER IMAGE SWAP (Desktop Only) */}
                                {secondImage && (
                                  <Image
                                    src={secondImage}
                                    alt={`${product.name} alt view`}
                                    fill
                                    className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                  />
                                )}
                              </motion.div>
                              
                              {/* DARK OVERLAY (Mobile Only) */}
                              <div className="md:hidden absolute inset-0 bg-black/10" />

                              {/* QUICK ADD BUTTON - Desktop Only */}
                              <button
                                onClick={(e) => handleQuickAdd(e, product)}
                                className="hidden md:flex absolute bottom-3 right-3 w-10 h-10 bg-white text-black rounded-full items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white shadow-lg z-30"
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>
                            </div>

                            {/* CARD INFO */}
                            <div>
                              <h3 className="text-sm md:text-lg font-bold text-white uppercase tracking-tight leading-tight mb-1 group-hover:text-blue-500 transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
                                {product.category}
                              </p>
                              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                  <p className="text-base md:text-lg font-bold text-white font-mono">
                                    ${product.price}
                                  </p>
                                  <ArrowRight className="w-4 h-4 text-gray-600 -rotate-45 group-hover:rotate-0 group-hover:text-white transition-all duration-300" />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                      
                      {/* "VIEW ALL" CARD - Desktop Only */}
                      <Link 
                          href={items.length > 0 ? `/shop/${items[0].category.replace(/ /g, "-")}` : '#'} 
                          className="hidden md:flex flex-col items-center justify-center aspect-[3/4] border border-dashed border-white/10 rounded-xl hover:bg-white/5 transition-colors group text-center p-6 bg-zinc-900/20"
                      >
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/10">
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                          </div>
                          <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500 group-hover:text-white">
                            View All <br/> {subcat}
                          </p>
                      </Link>
                    </div>
                  </motion.div>
                ))}

                {/* EMPTY STATE */}
                {!loading && Object.keys(groupedDrops).length === 0 && (
                    <div className="text-center py-20 border border-white/10 rounded-3xl bg-zinc-900/30">
                      <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">No new drops found in this category.</p>
                      <button onClick={() => setActiveCategory("All")} className="mt-4 text-blue-500 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">View All Drops</button>
                    </div>
                )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: FILTERS (STICKY) --- */}
          <div className="w-full lg:w-64 flex-shrink-0 lg:order-last hidden lg:block">
            {/* Sticky Wrapper */}
            <div className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                Filter Category
              </p>
              
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-between group ${
                      activeCategory === cat 
                        ? "bg-white text-black shadow-lg" 
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {cat}
                    {activeCategory === cat && <ArrowRight className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}