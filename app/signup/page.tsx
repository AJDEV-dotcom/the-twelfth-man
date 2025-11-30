"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

// Define the optimized image URL once
const BG_IMAGE_URL = "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Inject preload link tag for immediate background download
  const HeadContent = () => (
    <head>
      <link 
        rel="preload" 
        as="image" 
        href={BG_IMAGE_URL} 
      />
    </head>
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Artificial delay for smooth UX (optional)
    await new Promise(resolve => setTimeout(resolve, 800));

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      // Optional: Redirect after a delay or let them see the success message
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
        {/* FIXED: Using optimized URL for fast loading */}
        <img 
          src={BG_IMAGE_URL}
          alt="Stadium texture"
          className="w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
        <AnimatePresence mode="wait">
          {success ? (
              /* SUCCESS STATE */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900/80 backdrop-blur-xl border border-green-500/30 p-8 rounded-3xl text-center shadow-2xl"
            >
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <ShieldCheck className="w-10 h-10 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Aboard!</h2>
              <p className="text-gray-400">Your account has been created successfully.</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting to login...</p>
            </motion.div>
          ) : (
            /* SIGN UP FORM */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl"
            >
              <div className="text-center mb-8">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-black text-white tracking-tighter uppercase"
                >
                  Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Squad</span>
                </motion.h2>
                <p className="mt-2 text-gray-400 text-sm">Create your Twelfth Man account</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-5">
                {/* ERROR MESSAGE */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* EMAIL INPUT */}
                <div className="group space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT */}
                <div className="group space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full relative overflow-hidden group bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Sign Up <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  {/* Hover Gradient Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </form>

              {/* FOOTER */}
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  Already part of the team?{" "}
                  <Link href="/login" className="text-white font-medium hover:text-blue-400 transition-colors underline decoration-blue-500/50 decoration-2 underline-offset-4">
                    Sign in here
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}