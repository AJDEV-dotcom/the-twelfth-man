"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight, Sparkles, ArrowUpRight } from "lucide-react";
import Lenis from "lenis";

// --- PRELOADER COMPONENT ---
function Preloader() {
  const text = "THE TWELFTH MAN";
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
      y: "-100%", // Slide up reveal
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1] as const, // FIXED: Added 'as const'
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
        ease: [0.22, 1, 0.36, 1] as const, // FIXED: Added 'as const'
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
      <div className="flex gap-2 md:gap-4 overflow-hidden relative px-4 flex-wrap justify-center">
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={item}
            className="text-4xl md:text-8xl font-black tracking-tighter uppercase"
          >
            {word}
          </motion.span>
        ))}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"
        />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null); // FIXED: Added type
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
      if (typeof document !== "undefined") {
        document.body.style.overflow = "hidden";
      }
    } else {
      lenisRef.current?.start();
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    }
  }, [loading]);

  // --- MINIMUM LOAD TIME ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // --- PARALLAX HERO ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="bg-white relative min-h-screen selection:bg-blue-600 selection:text-white">
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* PRELOADER */}
      <AnimatePresence mode="wait">
        {loading && <Preloader key="preloader" />}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="relative">
        
        {/* --- HERO SECTION --- */}
        <section className="relative h-[100svh] flex items-center justify-center overflow-hidden bg-black">
          {/* Background Image with Parallax */}
          <motion.div style={{ y }} className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10" /> 
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black z-10" />
            
            <img 
              src="https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=2076&auto=format&fit=crop" 
              className="w-full h-full object-cover scale-110"
              alt="Stadium Atmosphere"
              // Removed fetchPriority to prevent potential TS errors
            />
          </motion.div>

          {/* Hero Content */}
          <motion.div 
            style={{ y: textY }} 
            className="relative z-20 w-full max-w-[90rem] mx-auto px-6"
          >
            <div className="flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="h-[1px] w-12 bg-white/50"></div>
                <span className="text-sm font-bold tracking-[0.3em] text-white/80 uppercase">
                  Est. 2024
                </span>
              </motion.div>

              <h1 className="text-6xl sm:text-7xl md:text-[12vw] leading-[0.85] font-black tracking-tighter text-white uppercase mix-blend-difference mb-8">
                <motion.span 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
                  className="block"
                >
                  Defy
                </motion.span>
                <motion.span 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
                  className="block text-transparent stroke-text"
                  style={{ WebkitTextStroke: "2px white", color: "transparent" }}
                >
                  The Odds
                </motion.span>
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 max-w-2xl"
              >
                <p className="text-lg md:text-xl font-medium text-gray-300 leading-relaxed">
                  The 24/25 Kits have landed. Engineered for the fearless, designed for the champions.
                </p>
                
                <Link href="#shop" className="group flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white transition-colors duration-500">
                    <ArrowRight className="w-6 h-6 text-white group-hover:text-black transition-colors duration-500" />
                  </div>
                  <span className="text-white font-bold tracking-widest uppercase text-sm group-hover:underline decoration-blue-500 underline-offset-4">
                    Shop Now
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* --- MARQUEE SCROLL --- */}
        <div className="bg-blue-600 py-4 md:py-6 overflow-hidden relative z-20 rotate-[-2deg] scale-110 border-y-4 border-black">
            <MarqueeText />
        </div>

        {/* --- SHOP BY CATEGORY SECTION --- */}
        <section id="shop" className="relative z-10 bg-zinc-950 py-20 md:py-32 overflow-hidden">
          
          {/* Animated Background Ambience */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
                x: [0, 50, 0]
              }}
              transition={{ 
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-blue-900/30 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
                x: [0, -30, 0]
              }}
              transition={{ 
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2 
              }}
              className="absolute top-1/2 right-[-100px] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"
            />
          </div>

          <div className="max-w-[90rem] mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-8">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.8] mb-4"
                >
                  Shop By <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">Category</span>
                </motion.h2>
              </div>
              <div className="mb-4">
                <Link href="/shop/all" className="flex items-center gap-2 text-lg md:text-xl font-bold uppercase tracking-wide text-gray-400 hover:text-white transition-colors">
                  View All Categories <ArrowUpRight className="w-6 h-6" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <CategoryCard title="Footballs" image="https://images.unsplash.com/photo-1614632535561-3c3783031637?q=80&w=2070&auto=format&fit=crop" />
              <CategoryCard title="Boots" image="https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1964&auto=format&fit=crop" />
              <CategoryCard title="Kits & Apparel" image="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2070&auto=format&fit=crop" />
              <CategoryCard title="Training Gear" image="https://images.unsplash.com/photo-1526232636376-53d03f24f092?q=80&w=2070&auto=format&fit=crop" />
              <CategoryCard title="Accessories" image="https://images.unsplash.com/photo-1562077772-3bd718577911?q=80&w=2070&auto=format&fit=crop" />
              <CategoryCard title="Goalkeeper" image="https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=2074&auto=format&fit=crop" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// --- MARQUEE COMPONENT ---
function MarqueeText() {
  return (
    <div className="flex whitespace-nowrap overflow-hidden">
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
        className="flex gap-4 md:gap-8 items-center"
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 md:gap-8">
            <span className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">The Twelfth Man</span>
            <Sparkles className="w-4 h-4 md:w-8 md:h-8 text-black" />
            <span className="text-4xl md:text-6xl font-black text-transparent stroke-text-black uppercase" style={{ WebkitTextStroke: "1px black" }}>Season 24/25</span>
            <div className="w-2 h-2 md:w-4 md:h-4 bg-black rounded-full" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// --- CATEGORY CARD COMPONENT ---
function CategoryCard({ title, image }: { title: string, image: string }) {
  // Generate a URL-friendly slug (e.g., "Training Gear" -> "/shop/Training-Gear")
  // This matches the logic in your dynamic page which replaces dashes with spaces
  const slug = title.replace(/ /g, "-");

  return (
    <Link href={`/shop/${slug}`} className="group relative h-[300px] md:h-[400px] overflow-hidden block rounded-2xl">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="absolute inset-0"
      >
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors duration-500" />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter text-center group-hover:scale-110 transition-transform duration-500 z-10 drop-shadow-lg">
          {title}
        </h3>
      </div>
      {/* Decorative Border on Hover */}
      <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 transition-colors duration-500 rounded-2xl pointer-events-none" />
    </Link>
  );
}