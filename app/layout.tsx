import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // 1. Import the Footer
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Twelfth Man",
  description: "Premium football kits and apparel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {/* Navigation is always at the top */}
            <Navbar />
            
            {/* This renders the specific page content (Home, Shop, etc.) */}
            {children}
            
            {/* 2. Add Footer here so it appears at the bottom of every page */}
            <Footer />
            
            {/* Notifications overlay */}
            <ToastProvider />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}