"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// 1. Define the shape of a Cart Item
export type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

type CartContextType = {
  cartCount: number;
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 2. Calculate count based on actual items
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (newItem: CartItem) => {
    setCartItems((prevItems) => {
      // Check if item already exists to update quantity instead of adding duplicate
      const existingItem = prevItems.find((item) => item.id === newItem.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevItems, newItem];
    });
  };

  return (
    <CartContext.Provider value={{ cartCount, cartItems, addToCart }}>
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