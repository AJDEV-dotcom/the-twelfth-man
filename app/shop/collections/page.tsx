"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react"; // Removed History import
import { Nosifer, Playfair_Display } from "next/font/google";
import Lenis from "lenis";
import { supabase } from "@/lib/supabase";

// --- FONTS ---
const nosifer = Nosifer({ weight: '400', subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'], style: ['italic', 'normal'] });

// --- TYPES ---
type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
};

// --- MOCK DATA FOR "ERAS" ---
const ERAS = [
  {
    id: "90s",
    title: "The 90s Serie A",
    year: "1990 - 1999",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop",
    desc: "Seven Sisters. Baggy kits. Pure Calcio."
  },
  {
    id: "galacticos",
    title: "The Galacticos",
    year: "2000 - 2006",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop",
    desc: "Beckham. Zidane. R9. The era of superstars."
  },
  {
    id: "joga",
    title: "Joga Bonito",
    year: "2004 - 2010",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop",
    desc: "The Brazilian flair that changed the game forever."
  }
];

// --- PRELOADER ---
function TimelessPreloader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 0.2 }}
           className="flex items-center gap-4 mb-4"
         >
           <div className="h-[1px] w-8 md:w-12 bg-yellow-600" />
           <span className="text-yellow-600 font-serif italic tracking-widest text-xs md:text-base">Est. Forever</span>
           <div className="h-[1px] w-8 md:w-12 bg-yellow-600" />
         </motion.div>

         <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`${nosifer.className} text-4xl md:text-8xl text-white tracking-widest mb-2`}
         >
           TIMELESS XI
         </motion.h1>
         
         <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className={`${playfair.className} text-gray-400 italic text-lg md:text-xl`}
         >
           "Class is permanent."
         </motion.p>
      </div>
    </motion.div>
  );
}

export default function CollectionsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const lenisRef = useRef<Lenis | null>(null);

  // Parallax Refs
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // --- INIT ---
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenisRef.current = lenis;
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // Simulate "Opening the Vault"
    setTimeout(() => setLoading(false), 2000);

    return () => lenis.destroy();
  }, []);

  // --- FETCH RETRO PRODUCTS ---
  useEffect(() => {
    async function fetchRetro() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .or('category.eq.Retro,name.ilike.%classic%,name.ilike.%retro%')
        .limit(12);
      
      if (data) setProducts(data);
    }
    fetchRetro();
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-yellow-900 selection:text-white overflow-x-hidden">
      
      {/* GLOBAL NOISE */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.07]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      
      {/* CREATIVE BG: GOLDEN FOG */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-yellow-900/10 rounded-full blur-[150px] animate-pulse" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-yellow-800/5 rounded-full blur-[150px]" />
      </div>

      <AnimatePresence>
        {loading && <TimelessPreloader />}
      </AnimatePresence>

      {/* --- HERO: THE MANIFESTO --- */}
      <section ref={heroRef} className="relative h-[90svh] flex flex-col items-center justify-center overflow-hidden px-4">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl w-full">
          
          <h1 className={`${nosifer.className} text-4xl sm:text-7xl md:text-9xl mb-6 md:mb-8 tracking-widest relative leading-tight`}>
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-yellow-600">TIMELESS XI</span>
            <span className="absolute left-1 top-1 text-black/50 -z-10 blur-sm">TIMELESS XI</span>
          </h1>

          <div className={`${playfair.className} text-lg sm:text-xl md:text-3xl italic leading-relaxed max-w-3xl mx-auto px-2 drop-shadow-md`}>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-yellow-600">"Form is temporary. </span>
            <span className="text-yellow-500 font-bold">
              Class is permanent.
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-yellow-600"> We have opened the vault to bring you the kits that defined generations."</span>
          </div>
        </motion.div>

        {/* Background Montage */}
        <div className="absolute inset-0 z-0 opacity-30">
           <Image 
             src="https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000&auto=format&fit=crop" 
             alt="Retro Football" 
             fill 
             priority
             sizes="100vw"
             className="object-cover grayscale"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-transparent to-[#080808]" />
        </div>
      </section>

      {/* --- SECTION 1: THE ERAS (Mobile Optimized) --- */}
      <section className="py-12 md:py-32 border-t border-white/5 relative z-10">
        <div className="max-w-[90rem] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-2">
             <h2 className={`${playfair.className} text-3xl md:text-6xl italic`}>Choose Your <span className="text-yellow-600">Era</span></h2>
             <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-500">Curated History</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {ERAS.map((era, i) => (
              <div key={era.id} className="group relative aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-sm cursor-pointer">
                <Image 
                  src={era.image} 
                  alt={era.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-all duration-700 md:group-hover:scale-105 md:group-hover:grayscale-0 md:grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 md:group-hover:opacity-60 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <div className="text-yellow-600 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">{era.year}</div>
                  <h3 className={`${nosifer.className} text-xl md:text-3xl text-white mb-2 md:mb-4`}>{era.title}</h3>
                  <p className="text-zinc-400 text-xs md:text-sm leading-relaxed opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 md:transform md:translate-y-4 md:group-hover:translate-y-0">
                    {era.desc}
                  </p>
                  <div className="mt-4 md:mt-6 h-px w-full bg-white/20 md:scale-x-0 md:group-hover:scale-x-100 transition-transform duration-700 origin-left block" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 2: THE VAULT (Product Grid) --- */}
      <section className="py-12 md:py-32 bg-[#0a0a0a] relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="text-center mb-12 md:mb-24">
             {/* Removed History Icon */}
             <h2 className={`${nosifer.className} text-3xl md:text-6xl uppercase tracking-widest mb-4 md:mb-6`}>
               From The <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-700">Vault</span>
             </h2>
             <p className="text-zinc-500 uppercase tracking-widest text-[10px] md:text-xs">Verified Authentic • Player Issue • Rare</p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-24">
              {products.map((product, i) => (
                <Link href={`/product/${product.id}`} key={product.id} className="group block max-w-sm mx-auto w-full">
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] bg-white p-2 md:p-3 shadow-2xl transform transition-transform duration-500 md:group-hover:-translate-y-2 md:group-hover:rotate-1">
                    <div className="relative w-full h-full overflow-hidden bg-zinc-100">
                      <Image 
                        src={product.image_url || "/placeholder.jpg"} 
                        alt={product.name} 
                        fill 
                        className="object-cover mix-blend-multiply md:filter md:grayscale md:group-hover:grayscale-0 transition-all duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className={`absolute bottom-4 right-4 md:bottom-6 md:right-6 ${playfair.className} text-black/50 text-[10px] md:text-xs -rotate-12`}>
                       Auth. 12th Man
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center mt-4 md:mt-8 space-y-2">
                    <h3 className={`${playfair.className} text-xl md:text-2xl text-white italic`}>{product.name}</h3>
                    <div className="flex items-center justify-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500">
                       <span>{product.category}</span>
                       <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                       <span className="text-yellow-600 font-mono">${product.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-white/10 rounded-lg bg-white/5">
              <p className={`${playfair.className} text-xl md:text-2xl text-zinc-500 italic`}>The Vault is currently empty.</p>
              <p className="text-zinc-600 text-xs md:text-sm mt-2">Check back later for new history drops.</p>
            </div>
          )}

        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 md:py-32 border-t border-white/5 flex flex-col items-center justify-center text-center px-6 relative z-10">
        <Quote className="w-6 h-6 md:w-8 md:h-8 text-yellow-800 mb-6 rotate-180" />
        <h3 className={`${playfair.className} text-2xl md:text-5xl max-w-4xl leading-tight mb-8 md:mb-10 italic text-zinc-300`}>
          "Some people believe football is a matter of life and death... I can assure you it is much, much more important than that."
        </h3>
        <p className="text-zinc-600 text-xs md:text-sm uppercase tracking-widest mb-10 md:mb-12">— Bill Shankly</p>
        <Link href="/shop/all" className="px-8 py-3 md:px-10 md:py-4 border border-white/20 text-white text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500">
          View Full Collection
        </Link>
      </section>
    </div>
  );
}