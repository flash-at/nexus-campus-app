
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface Vendor {
  business_name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number;
  quantity: number;
  image_url?: string;
  vendor: Vendor;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const discounted = product.price * (1 - (product.discount_percentage || 0) / 100);
  return (
    <Card>
      <div className="h-44 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          : <span className="text-4xl">📦</span>
        }
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold mb-1">{product.name}</h4>
        <p className="text-xs text-muted-foreground mb-1">{product.description}</p>
        <div className="text-xs flex items-center gap-2 mb-2">
          <MapPin className="h-3 w-3" />
          <span>{product.vendor.business_name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-bold text-lg">
            ₹{discounted.toFixed(2)}
            {product.discount_percentage > 0 && (
              <span className="ml-2 text-sm text-muted-foreground line-through">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            disabled={product.quantity <= 0}
          >
            {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
