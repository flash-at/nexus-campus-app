
import React from "react";
import { ProductCard } from "./ProductCard";

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

interface ProductGridProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {products.map((product) => (
      <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
    ))}
  </div>
);
