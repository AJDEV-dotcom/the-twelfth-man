"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, ShoppingBag, X, ArrowRight } from "lucide-react";
import Lenis from "lenis";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  image_urls?: string[]; 
  category: string;
  subcategory?: string;
};

// --- SIZE CONFIG ---
const SIZE_CONFIG: Record<string, string[]> = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  footwear: ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11"],
  gloves: ["Size 7", "Size 8", "Size 9", "Size 10", "Size 11"],
  balls: ["Size 4", "Size 5"],
  equipment: ["One Size"],
};

// --- ADAPTED PRELOADER FOR CATEGORY ---
function CategoryPreloader({ text }: { text: string }) {
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

export default function CategoryPage() {
  const params = useParams();
  const categoryRaw = params.category as string;
  const categoryName = decodeURIComponent(categoryRaw).replace(/-/g, " ");
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  
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

  // --- LOCK SCROLL DURING LOADING OR MODAL ---
  useEffect(() => {
    if (loading || showSizeModal) {
      lenisRef.current?.stop();
      if (typeof document !== 'undefined') document.body.style.overflow = "hidden";
    } else {
      lenisRef.current?.start();
      if (typeof document !== 'undefined') document.body.style.overflow = "";
    }
  }, [loading, showSizeModal]);

  // --- FETCH DATA & HANDLE LOADER ---
  useEffect(() => {
    async function fetchProducts() {
      let query = supabase.from("products").select("*");

      if (categoryName.toLowerCase() !== "all") {
        query = query.ilike("category", categoryName);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error:", error);
        toast.error("Failed to load products");
      } else {
        const fetchedProducts = data as Product[];
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);

        const subs = Array.from(new Set(fetchedProducts.map(p => p.subcategory).filter(Boolean))) as string[];
        setSubcategories(subs);
      }

      setTimeout(() => {
        setLoading(false);
      }, 2500);
    }

    fetchProducts();
  }, [categoryName]);

  const handleFilter = (sub: string) => {
    setActiveFilter(sub);
    if (sub === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.subcategory === sub));
    }
  };

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
      toast.success("Added to your locker!", {
        icon: <ShoppingBag className="w-5 h-5 text-green-500" />,
        duration: 3000,
      });
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
    
    toast.success("Added to your locker!", {
      icon: <ShoppingBag className="w-5 h-5 text-green-500" />,
      duration: 3000,
    });
    
    setShowSizeModal(false);
    setSelectedProduct(null);
    setSelectedSize("");
  };

  // Get current sizes for modal
  const currentSizeType = selectedProduct ? determineSizeType(selectedProduct.category, selectedProduct.subcategory) : "apparel";
  const currentSizes = SIZE_CONFIG[currentSizeType];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white pt-32 pb-20 relative">
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* PRELOADER */}
      <AnimatePresence mode="wait">
        {loading && <CategoryPreloader key="cat-loader" text={categoryName} />}
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
        
        {/* HEADER */}
        <div className="mb-12 md:mb-16">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-9xl font-black uppercase tracking-tighter text-white mb-4"
          >
            {categoryName}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 font-medium text-sm md:text-lg uppercase tracking-widest"
          >
            {products.length} {products.length === 1 ? 'Item' : 'Items'} Found
          </motion.p>
        </div>

        {/* FILTERS */}
        {subcategories.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-2 md:gap-3 mb-12 md:mb-16"
          >
            <button
              onClick={() => handleFilter("All")}
              className={`px-6 py-2 md:px-8 md:py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${
                activeFilter === "All" 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-gray-500 border-white/10 hover:border-white hover:text-white"
              }`}
            >
              All
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => handleFilter(sub)}
                className={`px-6 py-2 md:px-8 md:py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${
                  activeFilter === sub 
                    ? "bg-white text-black border-white" 
                    : "bg-transparent text-gray-500 border-white/10 hover:border-white hover:text-white"
                }`}
              >
                {sub}
              </button>
            ))}
          </motion.div>
        )}

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 gap-y-8 md:gap-x-8 md:gap-y-16">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => {
              const mainImage = product.image_url || "https://via.placeholder.com/400";
              const secondImage = product.image_urls && product.image_urls.length > 1 ? product.image_urls[1] : null;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={product.id}
                  className="group"
                >
                  <Link href={`/product/${product.id}`} className="block relative">
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] bg-zinc-900 rounded-xl overflow-hidden mb-4 border border-white/5 group-hover:border-blue-500/50 transition-colors duration-500">
                      
                      {/* Tag */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className="px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-sm shadow-lg">
                          {product.subcategory || "New"}
                        </span>
                      </div>

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
                    
                    {/* Product Info */}
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center border border-white/10 rounded-3xl bg-white/5">
            <p className="text-4xl md:text-6xl font-black text-white/20 uppercase tracking-tighter mb-4">Empty Locker</p>
            <p className="text-gray-500 uppercase tracking-widest text-sm">No products found in this category yet.</p>
            <Link href="/" className="mt-8 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 hover:text-white transition-colors">
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}