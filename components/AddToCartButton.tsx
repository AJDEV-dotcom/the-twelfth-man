"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";

// Define the props so we can pass product data to this button
type AddToCartProps = {
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
};

export default function AddToCartButton({ product }: AddToCartProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigating if this button is inside a Link
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    });

    setIsAdded(true);
    // Reset the "Added" state after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2
        ${isAdded 
          ? "bg-green-600 text-white hover:bg-green-700" 
          : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
    >
      {isAdded ? (
        "Added to Bag!"
      ) : (
        <>
          Add to Cart <ShoppingBag className="w-5 h-5" />
        </>
      )}
    </button>
  );
}