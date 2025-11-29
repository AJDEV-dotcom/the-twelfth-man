"use client";

import Link from "next/link";
import { Instagram, ArrowRight, CreditCard } from "lucide-react";
import { Nosifer } from "next/font/google";

const nosifer = Nosifer({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap',
});

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* TOP SECTION: Grid - 5 columns for layout balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* 1. BRAND - Spans 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className={`${nosifer.className} text-2xl text-white tracking-wider`}>
                The Twelfth Man<span className="text-blue-600">.</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Engineered for the fearless. We bring you the authentic gear worn by champions. Wear your colors with pride.
            </p>
            <div className="flex gap-4">
              <SocialLink 
                href="https://www.instagram.com/club.twelfth/" 
                icon={<Instagram className="w-5 h-5" />}
                hoverColorClass="hover:bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:text-white"
              />
              <SocialLink 
                href="mailto:club.twelfth@gmail.com" 
                icon={
                  // Official Gmail Icon Path
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-5 h-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" 
                      fill="#EA4335" 
                    />
                  </svg>
                }
                hoverColorClass="hover:bg-white"
              />
              <SocialLink 
                href="https://wa.me/918689927975" 
                icon={
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-5 h-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                }
                hoverColorClass="hover:bg-white"
              />
            </div>
          </div>

          {/* 2. SHOP */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white">Shop</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/shop/all" className="hover:text-blue-500 transition-colors">All Products</Link></li>
              <li><Link href="/shop/new-drops" className="hover:text-blue-500 transition-colors">New Drops</Link></li>
              <li><Link href="/shop/collections" className="hover:text-blue-500 transition-colors">Collections</Link></li>
              <li><Link href="/shop/sale" className="hover:text-blue-500 transition-colors text-red-500 font-bold">Sale</Link></li>
            </ul>
          </div>

          {/* 3. SUPPORT */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white">Support</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Order Status</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Returns & Exchange</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Size Guide</Link></li>
              {/* UPDATED LINK */}
              <li><Link href="/contact" className="hover:text-blue-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* 4. NEWSLETTER */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white">Join the Squad</h3>
            <p className="text-gray-400 text-sm mb-4">
              Sign up for exclusive drops and get 10% off your first order.
            </p>
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM SECTION: Copyright & Payment */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} The Twelfth Man. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
             {/* Simple visual representation of cards */}
             <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center"><span className="text-[8px] font-bold">VISA</span></div>
             <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center"><span className="text-[8px] font-bold">MC</span></div>
             <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center"><span className="text-[8px] font-bold">AMEX</span></div>
             <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center"><span className="text-[8px] font-bold">PAYPAL</span></div>
          </div>
        </div>

      </div>
    </footer>
  );
}

function SocialLink({ href, icon, hoverColorClass }: { href: string; icon: React.ReactNode; hoverColorClass?: string }) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // Added 'group' here so children (icons) can detect hover
      className={`group w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 transition-all duration-300 ${hoverColorClass || 'hover:bg-blue-600 hover:text-white'}`}
    >
      {icon}
    </a>
  );
}