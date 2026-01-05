"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client"; // CHANGED: Updated import
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

// Define the optimized image URL once
const BG_IMAGE_URL = "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Artificial delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 800));

    // CHANGED: Instantiate client here
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    // CHANGED: Instantiate client here
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This ensures the code is sent back correctly
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
        {/* FIXED: Using optimized URL for fast loading */}
        <img 
          src={BG_IMAGE_URL}
          alt="Stadium texture"
          className="w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
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
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Back</span>
            </motion.h2>
            <p className="mt-2 text-gray-400 text-sm">Sign in to access your locker</p>
          </div>

          <div className="space-y-5">
            {/* GOOGLE SIGN IN BUTTON */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all disabled:opacity-50"
              suppressHydrationWarning
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </motion.button>

            {/* DIVIDER */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div className="group space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                  <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    suppressHydrationWarning
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
                suppressHydrationWarning
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                {/* Hover Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </form>
          </div>

          {/* FOOTER */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-white font-medium hover:text-blue-400 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}