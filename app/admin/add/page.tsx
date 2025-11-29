"use client";

import React, { useState } from "react"; 
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, Plus, Image as ImageIcon, X } from "lucide-react";
import toast from "react-hot-toast";

// --- CATEGORY CONFIGURATION ---
const CATEGORIES: Record<string, string[]> = {
  "Footballs": ["Match Balls", "Training Balls", "Mini Balls", "Retro Balls"],
  "Boots": ["Firm Ground (FG)", "Soft Ground (SG)", "Artificial Grass (AG)", "Indoor/Futsal"],
  "Kits & Apparel": ["Authentic Jerseys", "Replica Jerseys", "Training Shorts", "Tracksuits", "Retro Kits"],
  "Training Gear": ["Bibs & Vests", "Cones & Markers", "Agility Ladders", "Rebounders"],
  "Accessories": ["Shin Guards", "Socks", "Water Bottles", "Gym Bags", "Captain Armbands"],
  "Goalkeeper": ["GK Gloves", "GK Jerseys", "Padded Pants", "Protection"],
};

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State for multiple images
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ 
      ...formData, 
      category: e.target.value, 
      subcategory: "" 
    });
  };

  // Handle Multiple Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));

      setImageFiles(prev => [...prev, ...filesArray]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Remove a specific image from the selection
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Adding product to locker...");

    try {
      const uploadedImageUrls: string[] = [];

      // 1. Upload All Images
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);
          
          uploadedImageUrls.push(publicUrl);
        }
      }

      // 2. Insert Product Data
      // We save the first image as 'image_url' (for backward compatibility)
      // And ALL images as 'image_urls' (for the gallery)
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          subcategory: formData.subcategory,
          image_url: uploadedImageUrls[0] || "", // Main image
          image_urls: uploadedImageUrls,         // Gallery (New Column)
          is_featured: true
        }])
        .select()
        .single();

      if (productError) throw productError;

      // 3. Insert Default Variants
      if (productData) {
        let sizes = ['S', 'M', 'L', 'XL'];
        if (formData.category === "Boots") sizes = ['US 8', 'US 9', 'US 10', 'US 11'];
        if (formData.category === "Footballs") sizes = ['Size 5', 'Size 4'];

        const variants = sizes.map(size => ({
          product_id: productData.id,
          size: size,
          stock_count: 20
        }));

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variants);
        
        if (variantError) throw variantError;
      }

      toast.success("Product Added to Locker!", { id: loadingToast });
      router.push("/admin/dashboard"); // FIXED: Redirect to Dashboard
      router.refresh(); 
      
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error adding product: " + (error.message || "Unknown error"), { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-12 px-4 selection:bg-blue-600 selection:text-white">
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/dashboard" className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Pitch
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            Manager Mode <span className="text-blue-600">/</span> Add Kit
          </h1>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* --- TOP SECTION: IMAGE & BASIC INFO --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Image Upload Area */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Product Images
                </label>
                
                {/* Image Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                      <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Upload Button */}
                  <div className="relative aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-blue-600 transition-colors bg-black/20 overflow-hidden group cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-blue-500">
                    <input 
                      type="file" 
                      multiple // ALLOWS MULTIPLE FILES
                      className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                    <Plus className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Add</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">First image will be the main cover.</p>
              </div>

              {/* Text Fields */}
              <div className="col-span-1 md:col-span-2 space-y-6">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Predator Elite FT"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                    onChange={handleInputChange}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-bold font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Describe the technical details..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all resize-none"
                    onChange={handleInputChange}
                  />
                </div>

              </div>
            </div>

            <div className="h-px w-full bg-white/10" />

            {/* --- BOTTOM SECTION: CATEGORIZATION --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Main Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
                  onChange={handleCategoryChange}
                >
                  <option value="" className="bg-black">Select Category</option>
                  {Object.keys(CATEGORIES).map((cat) => (
                    <option key={cat} value={cat} className="bg-black">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Sub-Category
                </label>
                <select
                  name="subcategory"
                  required
                  disabled={!formData.category}
                  value={formData.subcategory}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onChange={handleInputChange}
                >
                  <option value="" className="bg-black">
                    {formData.category ? "Select Type" : "Select Main Category First"}
                  </option>
                  {formData.category && CATEGORIES[formData.category]?.map((sub) => (
                    <option key={sub} value={sub} className="bg-black">{sub}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* --- SUBMIT BUTTON --- */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Transfer...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add to Locker
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}