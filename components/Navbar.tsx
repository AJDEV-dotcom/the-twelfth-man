"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { ShoppingBag, User, Menu, X, LogOut, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Nosifer } from "next/font/google";

// Initialize font at module scope
const nosifer = Nosifer({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap',
});

// Interface for MobileLink props
interface MobileLinkProps {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

// Interface for NavLink props
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function Navbar() {
  const cartContext = useCart();
  const authContext = useAuth();
  
  const cartCount = cartContext?.cartCount ?? 0;
  const user = authContext?.user;
  const signOut = authContext?.signOut;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Safely check for admin role
  const isAdmin = (user as any)?.app_metadata?.role === 'admin';

  // Desktop Scroll Handler
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock Body Scroll when Mobile Menu is Open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b
        /* --- MOBILE DEFAULTS (SIMPLIFIED) --- */
        /* Always Solid Black on Mobile to prevent flicker/lag */
        bg-zinc-950 border-white/10 py-4 shadow-lg shadow-black/50

        /* --- DESKTOP OVERRIDES (md:) --- */
        /* If scrolled: Keep black/blur. If top: Transparent. */
        ${scrolled 
          ? "md:bg-black/80 md:backdrop-blur-xl md:shadow-lg md:py-4" 
          : "md:bg-transparent md:border-transparent md:shadow-none md:py-6"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* 1. LOGO */}
          <Link href="/" className="group relative z-50 flex items-center gap-2">
            <span className={`${nosifer.className} text-xl md:text-2xl text-white tracking-wider`}>
              The Twelfth Man<span className="text-blue-500">.</span>
            </span>
          </Link>

          {/* 2. DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/shop/all">Shop</NavLink>
            <NavLink href="/shop/new-drops">New Drops</NavLink>
            <NavLink href="/shop/collections">Collections</NavLink>
          </div>

          {/* 3. RIGHT ACTIONS */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Account Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-sm font-bold uppercase tracking-wide text-white hover:text-blue-400 transition-colors py-2">
                  <User className="w-5 h-5" />
                  <span className="relative">
                    Account
                    {isAdmin && (
                      <span className="absolute -top-2 -right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-64 p-2 ring-1 ring-black/5">
                    
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-white/10 mb-2">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                    </div>

                    {/* ADMIN LINK (Updated to Dashboard) */}
                    {isAdmin && (
                      <Link 
                        href="/admin/dashboard" 
                        className="flex items-center space-x-3 px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20 mb-2 group/item"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="px-4 py-2 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                      Menu
                    </div>
                    
                    <button 
                      onClick={() => signOut && signOut()} 
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-bold uppercase tracking-wide text-white hover:text-blue-400 transition-colors">
                Sign In
              </Link>
            )}

            {/* Cart Icon */}
            <Link href="/cart" className="relative group">
              <div className="p-2.5 bg-white/10 group-hover:bg-blue-600 rounded-full transition-all duration-300">
                <ShoppingBag className="w-5 h-5 text-white transition-colors" />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black transform group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* 4. MOBILE MENU BUTTON */}
          <button 
            className="md:hidden relative z-50 p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 5. MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // Solid background to prevent lag/flicker
            className="fixed inset-0 bg-zinc-950 z-40 md:hidden pt-28 px-6 flex flex-col space-y-8 border-l border-white/10"
          >
            <div className="flex flex-col space-y-6">
              <MobileLink href="/shop/all" onClick={() => setIsMenuOpen(false)}>Shop</MobileLink>
              <MobileLink href="/shop/new-drops" onClick={() => setIsMenuOpen(false)}>New Drops</MobileLink>
              <MobileLink href="/shop/collections" onClick={() => setIsMenuOpen(false)}>Collections</MobileLink>
            </div>
            
            <div className="h-px bg-white/10 w-full" />

            <div className="flex flex-col space-y-6">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 text-gray-400 text-sm font-medium">
                    <User className="w-5 h-5" />
                    <span>{user?.email}</span>
                  </div>
                  
                  {/* ADMIN LINK MOBILE (Updated) */}
                  {isAdmin && (
                    <Link 
                      href="/admin/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 text-blue-500 font-bold text-xl"
                    >
                      <ShieldCheck className="w-6 h-6" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => { signOut && signOut(); setIsMenuOpen(false); }}
                    className="flex items-center space-x-2 text-red-500 font-black text-xl uppercase tracking-tight"
                  >
                    <LogOut className="w-6 h-6" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <MobileLink href="/login" onClick={() => setIsMenuOpen(false)}>Sign In</MobileLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// Helper Component for Desktop Links
function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link href={href} className="relative group py-2">
      <span className="text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors duration-300">
        {children}
      </span>
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

// Helper Component for Mobile Links
function MobileLink({ href, onClick, children, className = "" }: MobileLinkProps) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`text-4xl font-black uppercase tracking-tighter text-white/80 hover:text-blue-500 transition-colors ${className}`}
    >
      {children}
    </Link>
  );
}