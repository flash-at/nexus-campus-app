
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Clock, Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  preparation_time?: number;
  vendors?: { business_name: string };
  featured?: boolean;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  isLoading: boolean;
}

const ProductGrid = ({ products, onAddToCart, isLoading }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 animate-fade-in">
          <div className="relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 flex items-center justify-center">
                <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
            {product.featured && (
              <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
                Featured
              </Badge>
            )}
          </div>
          
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
              
              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {product.vendors?.business_name && (
                    <span>{product.vendors.business_name}</span>
                  )}
                  {product.preparation_time && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{product.preparation_time}m</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  ₹{product.price}
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onAddToCart(product)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
