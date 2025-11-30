"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export type CartItem = {
  id: number; // This is the product_id
  cart_id?: number; // This is the unique row id in cart_items table
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  size?: string;
};

type CartContextType = {
  cartCount: number;
  cartItems: CartItem[];
  cartTotal: number;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: number, size?: string) => Promise<void>;
  updateQuantity: (productId: number, size: string | undefined, delta: number) => Promise<void>;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Fetch Cart on Load or User Change
  useEffect(() => {
    async function loadCart() {
      if (user) {
        // LOGGED IN: Fetch from Supabase
        const { data, error } = await supabase
          .from("cart_items")
          .select(`
            id,
            quantity,
            size,
            product:products (id, name, price, image_url)
          `);

        if (error) {
          console.error("Error loading cart:", error);
        } else if (data) {
          // Transform DB shape to App shape
          const mappedItems: CartItem[] = data.map((row: any) => ({
            id: row.product.id,
            cart_id: row.id,
            name: row.product.name,
            price: row.product.price,
            image_url: row.product.image_url,
            quantity: row.quantity,
            size: row.size,
          }));
          setCartItems(mappedItems);
        }
      } else {
        // GUEST: Fetch from LocalStorage
        const savedCart = localStorage.getItem("twelfth-man-cart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        } else {
          setCartItems([]); // Clear if nothing saved
        }
      }
      setIsLoaded(true);
    }

    loadCart();
  }, [user]);

  // 2. Helper to Save Local (Guest only)
  const saveLocal = (items: CartItem[]) => {
    localStorage.setItem("twelfth-man-cart", JSON.stringify(items));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // --- ACTIONS ---

  const addToCart = async (newItem: CartItem) => {
    // Optimistic UI Update (Update screen immediately)
    const existingIndex = cartItems.findIndex(
      (item) => item.id === newItem.id && item.size === newItem.size
    );

    let updatedCart = [...cartItems];
    if (existingIndex >= 0) {
      updatedCart[existingIndex].quantity += newItem.quantity;
    } else {
      updatedCart.push(newItem);
    }
    setCartItems(updatedCart);

    // Backend Sync
    if (user) {
      const { error } = await supabase
        .from("cart_items")
        .upsert(
          {
            user_id: user.id,
            product_id: newItem.id,
            size: newItem.size,
            quantity: updatedCart.find(i => i.id === newItem.id && i.size === newItem.size)?.quantity
          },
          { onConflict: "user_id, product_id, size" }
        );

      if (error) {
        console.error("Error adding to DB cart:", error);
        toast.error("Could not save to account cart");
      }
    } else {
      saveLocal(updatedCart);
    }
  };

  const removeFromCart = async (productId: number, size?: string) => {
    const updatedCart = cartItems.filter(
      (item) => !(item.id === productId && item.size === size)
    );
    setCartItems(updatedCart);

    if (user) {
      // If size is present, match it, otherwise allow null size match
      let query = supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      
      if (size) query = query.eq("size", size);
      else query = query.is("size", null);

      const { error } = await query;
      if (error) console.error("Error deleting from DB:", error);
    } else {
      saveLocal(updatedCart);
    }
  };

  const updateQuantity = async (productId: number, size: string | undefined, delta: number) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === productId && item.size === size) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCartItems(updatedCart);

    if (user) {
      const targetItem = updatedCart.find(i => i.id === productId && i.size === size);
      if (targetItem) {
        let query = supabase
          .from("cart_items")
          .update({ quantity: targetItem.quantity })
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (size) query = query.eq("size", size);
        else query = query.is("size", null);

        const { error } = await query;
        if (error) console.error("Error updating DB qty:", error);
      }
    } else {
      saveLocal(updatedCart);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    } else {
      localStorage.removeItem("twelfth-man-cart");
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartCount, 
        cartItems, 
        cartTotal, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}