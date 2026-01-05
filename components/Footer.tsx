"use client";

import Link from "next/link";
import { Instagram, ArrowRight, Mail } from "lucide-react";
import { Nosifer } from "next/font/google";

const nosifer = Nosifer({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap',
});

export default function Footer() {
  return (
    <footer className="relative bg-zinc-950 text-white pt-16 pb-6 overflow-hidden">
      
      {/* Top Gradient Line - REMOVED */}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
          
          {/* 1. BRAND & SOCIALS (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block group">
              {/* Updated: Smaller text size on mobile (text-lg) to prevent wrapping */}
              <span className={`${nosifer.className} text-lg md:text-2xl text-white tracking-wider group-hover:text-blue-500 transition-colors`}>
                The Twelfth Man<span className="text-blue-600 group-hover:text-white">.</span>
              </span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Engineered for the fearless. Authentic gear for the true fans. Wear your colors with pride.
            </p>
            <div className="flex gap-3">
              <SocialLink 
                href="https://www.instagram.com/club.twelfth/" 
                icon={<Instagram className="w-5 h-5" />}
                hoverColorClass="hover:bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:text-white"
              />
              <SocialLink 
                href="mailto:club.twelfth@gmail.com" 
                icon={<Mail className="w-5 h-5" />}
                hoverColorClass="hover:bg-white hover:text-[#EA4335]"
              />
              <SocialLink 
                href="https://wa.me/918689927975" 
                icon={
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                }
                hoverColorClass="hover:bg-white hover:text-[#25D366]"
              />
            </div>
          </div>

          {/* 2. LINKS SECTION (Combined Grid - 4 Cols) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-white border-l-2 border-blue-600 pl-3">Shop</h3>
              <ul className="space-y-4">
                <FooterLink href="/shop/all">All Products</FooterLink>
                <FooterLink href="/shop/new-drops">New Drops</FooterLink>
                <FooterLink href="/shop/collections">Collections</FooterLink>
                <FooterLink href="/shop/sale" className="text-blue-400">Sale</FooterLink>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-white border-l-2 border-blue-600 pl-3">Support</h3>
              <ul className="space-y-4">
                <FooterLink href="#">Order Status</FooterLink>
                <FooterLink href="#">Shipping</FooterLink>
                <FooterLink href="#">Returns</FooterLink>
                <FooterLink href="/contact">Contact Us</FooterLink>
              </ul>
            </div>
          </div>

          {/* 3. NEWSLETTER (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-white">Join the Squad</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Unlock 10% off your first order and get early access to drops.
              </p>
              <form className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  suppressHydrationWarning
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all w-full"
                />
                <button 
                  suppressHydrationWarning
                  className="bg-white text-black hover:bg-blue-600 hover:text-white px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 w-full group"
                >
                  Subscribe <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="border-t border-white/5 pt-6 mt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[10px] md:text-xs text-zinc-500 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} THE TWELFTH MAN. ALL RIGHTS RESERVED.
          </p>
          
          {/* Removed Payment Icons */}
        </div>

      </div>
    </footer>
  );
}

// --- SUB-COMPONENTS ---

function FooterLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <li>
      <Link 
        href={href} 
        className={`text-sm text-zinc-400 hover:text-blue-500 hover:scale-105 origin-left transition-all duration-300 inline-flex items-center gap-1 ${className}`}
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon, hoverColorClass }: { href: string; icon: React.ReactNode; hoverColorClass?: string }) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 transition-all duration-300 ${hoverColorClass || 'hover:bg-blue-600 hover:text-white'}`}
    >
      {icon}
    </a>
  );
}