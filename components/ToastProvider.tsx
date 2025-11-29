"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        // Define default styles
        style: {
          background: "#09090b", // zinc-950
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "0.75rem", // rounded-xl
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // shadow-lg
          padding: "16px",
          fontSize: "14px",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.05em", // tracking-wider
        },
        // Default options for specific types
        success: {
          iconTheme: {
            primary: "#3b82f6", // blue-500
            secondary: "#fff",
          },
          style: {
            border: "1px solid rgba(59, 130, 246, 0.5)", // blue-500/50
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444", // red-500
            secondary: "#fff",
          },
          style: {
            border: "1px solid rgba(239, 68, 68, 0.5)", // red-500/50
          },
        },
      }}
    />
  );
}