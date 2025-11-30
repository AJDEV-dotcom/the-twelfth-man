"use client";

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The Suspense wrapper catches the hooks that fail during server-side rendering
    <Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center pt-32">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    }>
      {children}
    </Suspense>
  );
}