"use client";

import React, { useState, useEffect } from "react"; 
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, X, Plus, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES: Record<string, string[]> = {
  "Footballs": ["Match Balls", "Training Balls", "Mini Balls", "Retro Balls"],
  "Boots": ["Firm Ground (FG)", "Soft Ground (SG)", "Artificial Grass (AG)", "Indoor/Futsal"],
  "Kits & Apparel": ["Authentic Jerseys", "Replica Jerseys", "Training Shorts", "Tracksuits", "Retro Kits"],
  "Training Gear": ["Bibs & Vests", "Cones & Markers", "Agility Ladders", "Rebounders"],
  "Accessories": ["Shin Guards", "Socks", "Water Bottles", "Gym Bags", "Captain Armbands"],
  "Goalkeeper": ["GK Gloves", "GK Jerseys", "Padded Pants", "Protection"],
};

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Existing Images + New Uploads
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
  });

  // Fetch Existing Data
  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        toast.error("Error fetching product");
        router.push("/admin/dashboard");
      } else {
        setFormData({
          name: data.name,
          description: data.description || "",
          price: data.price,
          category: data.category,
          subcategory: data.subcategory || "",
        });
        
        // Handle images: Prefer array, fallback to single, default to empty
        if (data.image_urls && data.image_urls.length > 0) {
          setExistingImages(data.image_urls);
        } else if (data.image_url) {
          setExistingImages([data.image_url]);
        }
      }
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id, router]);

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

  // Handle New Image Selection
  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));

      setNewImageFiles(prev => [...prev, ...filesArray]);
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Remove Existing Image
  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // Remove New Image (Before Upload)
  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading("Updating product...");

    try {
      const uploadedImageUrls: string[] = [];

      // 1. Upload New Images
      if (newImageFiles.length > 0) {
        for (const file of newImageFiles) {
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

      // 2. Combine Existing + New Images
      const finalImages = [...existingImages, ...uploadedImageUrls];

      // 3. Update Database
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price as any),
          category: formData.category,
          subcategory: formData.subcategory,
          image_url: finalImages[0] || "", // Main image fallback
          image_urls: finalImages,         // Full gallery
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success("Product Updated Successfully!", { id: loadingToast });
      router.push("/admin/dashboard");
      router.refresh(); 
      
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error updating product: " + (error.message || "Unknown error"), { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-12 px-4 selection:bg-blue-600 selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/dashboard" className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            Edit Product <span className="text-blue-600">#{id}</span>
          </h1>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Image Management */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Product Images</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                
                {/* Existing Images */}
                {existingImages.map((src, index) => (
                  <div key={`exist-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-blue-500/30 group">
                    <img src={src} alt="Existing" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* New Previews */}
                {newImagePreviews.map((src, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-green-500/30 group">
                    <img src={src} alt="New Upload" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add Button */}
                <div className="relative aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-blue-600 transition-colors bg-black/20 overflow-hidden flex flex-col items-center justify-center text-gray-500 hover:text-blue-500 cursor-pointer">
                  <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleNewImageChange} />
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Add</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Name</label>
                <input type="text" name="name" value={formData.name} required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-blue-600 transition-all font-medium" onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Price</label>
                <input type="number" name="price" value={formData.price} step="0.01" required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-blue-600 transition-all font-bold font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" onChange={handleInputChange} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
              <textarea name="description" value={formData.description} rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-blue-600 transition-all resize-none" onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                <select name="category" value={formData.category} required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-blue-600 appearance-none cursor-pointer" onChange={handleCategoryChange}>
                  <option value="" className="bg-black">Select Category</option>
                  {Object.keys(CATEGORIES).map((cat) => <option key={cat} value={cat} className="bg-black">{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Sub-Category</label>
                <select name="subcategory" value={formData.subcategory} required disabled={!formData.category} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-blue-600 appearance-none cursor-pointer disabled:opacity-50" onChange={handleInputChange}>
                  <option value="" className="bg-black">{formData.category ? "Select Type" : "Select Main Category First"}</option>
                  {formData.category && CATEGORIES[formData.category]?.map((sub) => <option key={sub} value={sub} className="bg-black">{sub}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 mt-8">
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</> : <><Save className="w-5 h-5" /> Update Product</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}