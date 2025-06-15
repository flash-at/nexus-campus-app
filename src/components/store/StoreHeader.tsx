
import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Badge } from "lucide-react";

interface StoreHeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ cartCount, onCartClick }) => (
  <div className="sticky top-0 z-40 bg-background/95 border-b">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">Campus Store</h1>
      <Button
        variant="outline"
        onClick={onCartClick}
        className="relative"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Cart
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-primary text-white flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Button>
    </div>
  </div>
);
