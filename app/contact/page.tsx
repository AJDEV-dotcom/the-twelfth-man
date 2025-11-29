"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  // REPLACE THIS WITH YOUR NEW GOOGLE SCRIPT WEB APP URL
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz8pocnlrU4t17XI4QVtTkHLU-6AgO7I295tUsvP32bvyuQYlRllhOGrmgTDoUjwtPL6Q/exec";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: formData,
      });

      // Google Script returns plain text or JSON depending on setup, but typically implies success if no network error
      // Note: CORS might hide the detailed response content in some setups, but the request usually succeeds.
      
      toast.success("Message sent! We'll get back to you soon.");
      form.reset();
    } catch (error) {
      console.error("Error!", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white pt-32 pb-20 relative">
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4"
          >
            Get In <span className="text-blue-600">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 font-medium text-lg uppercase tracking-widest"
          >
            Questions? Collaborations? We're here.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          
          {/* --- LEFT: CONTACT FORM --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Name</label>
                  <input 
                    type="text" 
                    name="Name" // Must match Sheet Header
                    placeholder="Your Name" 
                    required 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Phone</label>
                  <input 
                    type="tel" 
                    name="Phone" // Must match Sheet Header
                    placeholder="Your Number" 
                    required 
                    pattern="[0-9]{10}" 
                    title="10 digit mobile number"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email</label>
                <input 
                  type="email" 
                  name="Email" // Must match Sheet Header
                  placeholder="your@email.com" 
                  required 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Message</label>
                <textarea 
                  name="Message" // Must match Sheet Header
                  rows={5} 
                  placeholder="Tell us what you need..." 
                  required 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-600 transition-all resize-none font-medium"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-5 rounded-xl hover:bg-blue-700 transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* --- RIGHT: INFO CARDS --- */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Card 1 */}
            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-8 hover:bg-zinc-900/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
              <p className="text-gray-400 text-sm mb-4">For order support and inquiries.</p>
              <a href="mailto:club.twelfth@gmail.com" className="text-blue-500 font-bold hover:underline">club.twelfth@gmail.com</a>
            </div>

            {/* Card 2 */}
            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-8 hover:bg-zinc-900/50 transition-colors group">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">WhatsApp</h3>
              <p className="text-gray-400 text-sm mb-4">Mon-Fri from 9am to 6pm.</p>
              <a href="https://wa.me/918689927975" target="_blank" className="text-green-500 font-bold hover:underline">+91 868 992 7975</a>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-8 hover:bg-zinc-900/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Live Chat</h3>
              <p className="text-gray-400 text-sm mb-4">Available on Instagram.</p>
              <a href="https://www.instagram.com/club.twelfth/" target="_blank" className="text-purple-500 font-bold hover:underline">@club.twelfth</a>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}