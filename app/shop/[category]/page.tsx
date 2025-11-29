"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, ShoppingBag, Plus } from "lucide-react";
import Lenis from "lenis";
import { useCart } from "@/context/CartContext";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  image_urls?: string[]; 
  category: string;
  subcategory?: string;
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

  // --- LOCK SCROLL DURING LOADING ---
  useEffect(() => {
    if (loading) {
      lenisRef.current?.stop();
      if (typeof document !== 'undefined') document.body.style.overflow = "hidden";
    } else {
      lenisRef.current?.start();
      if (typeof document !== 'undefined') document.body.style.overflow = "";
    }
  }, [loading]);

  // --- FETCH DATA & HANDLE LOADER ---
  useEffect(() => {
    async function fetchProducts() {
      // Don't reset loading to true here to avoid flickering if re-fetching
      
      let query = supabase.from("products").select("*");

      if (categoryName.toLowerCase() !== "all") {
        query = query.ilike("category", categoryName);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error:", error);
      } else {
        const fetchedProducts = data as Product[];
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);

        const subs = Array.from(new Set(fetchedProducts.map(p => p.subcategory).filter(Boolean))) as string[];
        setSubcategories(subs);
      }

      // RESTORED: Artificial delay to ensure the animation plays fully
      // But content is rendered behind it, so it won't feel "stuck" when it lifts
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

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    });
    
    alert("Added to Cart!"); // Simple feedback
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white pt-32 pb-20 relative">
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* PRELOADER */}
      <AnimatePresence mode="wait">
        {loading && <CategoryPreloader key="cat-loader" text={categoryName} />}
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

        {/* PRODUCT GRID - Rendered immediately (behind loader) for smoother reveal */}
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
                  className="group cursor-pointer"
                >
                  <Link href={`/product/${product.id}`} className="block">
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] mb-3 md:mb-6 overflow-hidden bg-zinc-900 rounded-lg">
                      
                      <motion.div
                        className="w-full h-full"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                      >
                        <img 
                          src={mainImage} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {secondImage && (
                          <img 
                            src={secondImage} 
                            alt={`${product.name} alternate view`}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        )}
                      </motion.div>
                      
                      {/* Tag */}
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                        <span className="px-2 py-1 md:px-3 md:py-1 bg-black/80 backdrop-blur-md text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest border border-white/10">
                          {product.subcategory || "New"}
                        </span>
                      </div>

                      {/* QUICK ADD BUTTON (Bottom Right, Visible on Hover) */}
                      <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="w-8 h-8 md:w-10 md:h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors shadow-lg"
                            title="Quick Add"
                          >
                            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start border-t border-white/10 pt-3 md:pt-4">
                      <div className="max-w-full md:max-w-[70%]">
                        <h3 className="text-sm md:text-lg font-bold text-white uppercase tracking-tight leading-tight mb-1 group-hover:text-blue-500 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                          In Stock
                        </p>
                      </div>
                      <p className="text-sm md:text-lg font-bold text-white mt-1 md:mt-0">
                        ${product.price}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State - Only show when NOT loading */}
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