"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, ArrowUpRight, X, ArrowRight } from "lucide-react";
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

// --- CONFIG ---
const CATEGORIES = ["All", "Footballs", "Boots", "Kits & Apparel", "Training Gear", "Accessories", "Goalkeeper"];

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryRaw = params.category as string;
  const categoryName = decodeURIComponent(categoryRaw).replace(/-/g, " ");
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  
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

  // --- FETCH DATA ---
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      
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
      }
      setLoading(false);
    }

    fetchProducts();
  }, [categoryName]);

  const handleCategoryClick = (cat: string) => {
    const slug = cat === "All" ? "all" : cat.replace(/ /g, "-");
    router.push(`/shop/${slug}`);
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
    setSelectedSize("");
    setSelectedProduct(null);
  };

  // Get current sizes for modal
  const currentSizeType = selectedProduct ? determineSizeType(selectedProduct.category, selectedProduct.subcategory) : "apparel";
  const currentSizes = SIZE_CONFIG[currentSizeType];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white pt-32 pb-20 relative">
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

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
          <h1 className="text-5xl md:text-9xl font-black uppercase tracking-tighter text-white mb-4">
            {categoryName}
          </h1>
          <p className="text-gray-400 font-medium text-sm md:text-lg uppercase tracking-widest">
            {products.length} {products.length === 1 ? 'Item' : 'Items'} Found
          </p>
        </div>

        {/* MAIN CATEGORY FILTER (Horizontal Scroll) */}
        <div className="flex overflow-x-auto pb-4 mb-12 md:mb-16 gap-2 md:gap-3 scrollbar-hide">
          {CATEGORIES.map((cat) => {
             const isActive = 
                (categoryName.toLowerCase() === "all" && cat === "All") || 
                (categoryName.toLowerCase() === cat.toLowerCase());

             return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`flex-shrink-0 px-6 py-2 md:px-8 md:py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${
                    isActive
                      ? "bg-white text-black border-white shadow-lg" 
                      : "bg-transparent text-gray-500 border-white/10 hover:border-white hover:text-white"
                  }`}
                >
                  {cat}
                </button>
             );
          })}
        </div>

        {/* LOADING SKELETON GRID */}
        {loading ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 gap-y-8 md:gap-x-8 md:gap-y-16">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="w-full">
                  <div className="aspect-[3/4] bg-zinc-900/50 rounded-lg animate-pulse mb-4" />
                  <div className="h-4 bg-zinc-900/50 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-zinc-900/50 rounded w-1/4 animate-pulse" />
               </div>
             ))}
           </div>
        ) : (
          /* PRODUCT GRID */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 gap-y-8 md:gap-x-8 md:gap-y-16">
            <AnimatePresence mode="popLayout">
              {products.map((product) => {
                const mainImage = product.image_url || "https://via.placeholder.com/400";
                const secondImage = product.image_urls && product.image_urls.length > 1 ? product.image_urls[1] : null;

                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    key={product.id}
                    className="group cursor-pointer"
                  >
                    <Link href={`/product/${product.id}`} className="block">
                      {/* Image Container */}
                      <div className="relative aspect-[3/4] mb-3 md:mb-6 overflow-hidden bg-zinc-900 rounded-lg border border-white/5 group-hover:border-blue-500/50 transition-colors duration-500">
                        
                        {/* IMAGE CONTAINER WITH ZOOM */}
                        <motion.div
                          className="w-full h-full relative"
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
                          
                          {/* Hover Image (Desktop) */}
                          {secondImage && (
                            <Image 
                              src={secondImage} 
                              alt={`${product.name} alternate view`}
                              fill
                              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                          )}
                        </motion.div>
                        
                        {/* DARK OVERLAY (Mobile Only) */}
                        <div className="md:hidden absolute inset-0 bg-black/10" />
                        
                        {/* Tag */}
                        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                          <span className="px-2 py-1 md:px-3 md:py-1 bg-black/80 backdrop-blur-md text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest border border-white/10">
                            {product.subcategory || "New"}
                          </span>
                        </div>

                        {/* QUICK ADD BUTTON (Desktop Only) */}
                        <button
                          onClick={(e) => handleQuickAdd(e, product)}
                          className="hidden md:flex absolute bottom-3 right-3 md:bottom-4 md:right-4 z-20 w-10 h-10 bg-white text-black rounded-full items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white shadow-lg"
                          title="Quick Add"
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
        )}

        {!loading && products.length === 0 && (
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