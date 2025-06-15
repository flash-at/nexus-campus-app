
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Cart } from './Cart';
import { StoreHeader } from "./StoreHeader";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { ProductGrid } from "./ProductGrid";
import { SearchBar } from "./SearchBar";

interface Category {
  id: string;
  name: string;
  icon: string;
}
interface Vendor {
  id: string;
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
  vendor_id: string;
  category_id?: string;
}

export interface DisplayProduct extends Product {
  vendor: Vendor;
}

export const CampusStorePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // --- LOAD ALL ROWS, NO FILTERING ---
      const { data: cats, error: catErr } = await supabase
        .from('store_categories')
        .select('id,name,icon');
      setCategories(cats || []);
      console.log("Fetched categories (Store):", cats);
      if (catErr) {
        console.error("Category fetch error:", catErr);
        setError(catErr.message);
      }

      const { data: vends, error: vendErr } = await supabase
        .from('vendors')
        .select('id,business_name');
      setVendors(vends || []);
      console.log("Fetched vendors (Store):", vends);
      if (vendErr) {
        console.error("Vendor fetch error:", vendErr);
        setError(vendErr.message);
      }

      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('*');
      setProducts(prods || []);
      console.log("Fetched products (Store):", prods);
      if (prodErr) {
        console.error("Product fetch error:", prodErr);
        setError(prodErr.message);
      }

    } catch (e: any) {
      setError(e.message || 'Could not load store data.');
      console.error("CampusStorePage general fetch error:", e);
    }
    setLoading(false);
  };

  const displayProducts: DisplayProduct[] = products
    .filter(p => !selectedCategory || p.category_id === selectedCategory)
    .filter(p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    )
    .map(p => ({
      ...p,
      vendor: vendors.find(v => v.id === p.vendor_id) || { id: '', business_name: 'Campus Store' }
    }));

  const addToCart = (product: DisplayProduct) => {
    if (cartItems.some(item => item.id === product.id)) {
      setCartItems(items =>
        items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems(items => [
        ...items,
        { ...product, quantity: 1 }
      ]);
    }
    toast({ title: 'Added to Cart', description: `${product.name} added to cart.` });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-sm">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-bold mb-2">Please log in to view the Campus Store</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCart) {
    return (
      <Cart
        items={cartItems}
        onUpdateQuantity={(pid, q) => {
          if (q === 0) setCartItems(a => a.filter(item => item.id !== pid));
          else setCartItems(a => a.map(item => item.id === pid ? { ...item, quantity: q } : item));
        }}
        onBack={() => setShowCart(false)}
        subtotal={cartItems.reduce((sum, item) => sum + (item.price * (1 - item.discount_percentage / 100)) * item.quantity, 0)}
        serviceFee={Math.max(5, cartItems.reduce((sum, item) => sum + (item.price * (1 - item.discount_percentage / 100)) * item.quantity, 0) < 100 ? 5 : 8)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setShowCart(true)}
      />
      <div className="container mx-auto px-4 py-6">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
        {loading && (
          <div className="text-center py-8 text-muted-foreground">Loading products...</div>
        )}
        {error && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="mb-4">{error}</p>
            <Button onClick={loadData}>Try Again</Button>
          </div>
        )}
        {!loading && !error && (
          <>
            {displayProducts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <h3>No products available.</h3>
                <p>Try removing filters or check console for debugging info above.</p>
              </div>
            ) : (
              <ProductGrid products={displayProducts} onAddToCart={addToCart} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
