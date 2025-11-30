"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      toastOptions={{
        // --- DEFAULT STYLES (Applies to all) ---
        className: '!bg-zinc-950/90 !backdrop-blur-xl !border !border-white/10 !text-white !rounded-xl !shadow-2xl !font-bold !uppercase !tracking-wider !text-xs !py-4 !px-6',
        
        // --- SUCCESS TOAST (Goal Scored Vibe) ---
        success: {
          iconTheme: {
            primary: '#22c55e', // Green-500
            secondary: 'black',
          },
          style: {
            borderLeft: '4px solid #22c55e', // Green Accent Bar
            background: 'linear-gradient(to right, rgba(34, 197, 94, 0.05), rgba(9, 9, 11, 0.9))',
          },
        },

        // --- ERROR TOAST (Red Card Vibe) ---
        error: {
          iconTheme: {
            primary: '#ef4444', // Red-500
            secondary: 'white',
          },
          style: {
            borderLeft: '4px solid #ef4444', // Red Accent Bar
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), rgba(9, 9, 11, 0.9))',
          },
        },

        // --- LOADING TOAST (Transfer Processing Vibe) ---
        loading: {
          iconTheme: {
            primary: '#3b82f6', // Blue-500
            secondary: 'transparent',
          },
          style: {
            borderLeft: '4px solid #3b82f6', // Blue Accent Bar
            background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(9, 9, 11, 0.9))',
            color: '#9ca3af', // Gray text for "Loading..."
          },
        },
        
        // Animation Duration
        duration: 4000,
      }}
    />
  );
}