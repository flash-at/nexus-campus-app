
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import type { DisplayProduct } from "./CampusStorePage";

interface ProductCardProps {
  product: DisplayProduct;
  onAddToCart: (p: DisplayProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const discounted = product.price * (1 - (product.discount_percentage || 0) / 100);
  const isOutOfStock = product.quantity <= 0;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-md">
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-6xl">📦</div>
        )}
        {product.discount_percentage > 0 && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-xs font-bold">
            {product.discount_percentage}% OFF
          </Badge>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-gray-800 text-white px-3 py-1">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <h4 className="font-bold text-lg mb-1 text-gray-800 leading-tight">{product.name}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="h-3 w-3" />
            <span>{product.vendor.business_name}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-green-600">₹{discounted.toFixed(2)}</span>
              {product.discount_percentage > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>4.5 (120)</span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`rounded-full px-4 py-2 font-medium transition-all duration-200 ${
              isOutOfStock 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:scale-105"
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
