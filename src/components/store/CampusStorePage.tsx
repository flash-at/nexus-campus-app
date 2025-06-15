
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, AlertCircle, MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Cart } from './Cart';

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
  category_id: string;
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
      // fetch categories
      const { data: cats, error: catErr } = await supabase
        .from('store_categories')
        .select('id,name,icon')
        .eq('active', true)
        .order('display_order');
      if (catErr) throw catErr;
      setCategories(cats || []);

      // fetch vendors
      const { data: vends, error: vendErr } = await supabase
        .from('vendors')
        .select('id,business_name')
        .eq('status', 'approved');
      if (vendErr) throw vendErr;
      setVendors(vends || []);

      // fetch products
      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      if (prodErr) throw prodErr;
      setProducts(prods || []);
    } catch (e: any) {
      setError(e.message ?? 'Could not load store data.');
    }
    setLoading(false);
  };

  // Filtered products
  const displayProducts = products
    .filter(p => !selectedCategory || p.category_id === selectedCategory)
    .filter(p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    )
    .map(p => ({
      ...p,
      vendor: vendors.find(v => v.id === p.vendor_id) || { business_name: 'Campus Store' }
    }));

  const addToCart = (product: Product, qty: number = 1) => {
    if (cartItems.some(item => item.id === product.id)) {
      setCartItems(items =>
        items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      );
    } else {
      setCartItems(items => [
        ...items,
        { ...product, quantity: qty }
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
      <div className="sticky top-0 z-40 bg-background/95 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Campus Store</h1>
          <Button
            variant="outline"
            onClick={() => setShowCart(true)}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {cartItems.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === '' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              All
            </Button>
            {categories.map(c => (
              <Button
                key={c.id}
                variant={selectedCategory === c.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(c.id)}
                className="whitespace-nowrap"
              >
                <span className="mr-1">{c.icon}</span>
                {c.name}
              </Button>
            ))}
          </div>
        </div>

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
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayProducts.map(product => {
                  const discounted = product.price * (1 - product.discount_percentage / 100);
                  return (
                    <Card key={product.id}>
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
                            onClick={() => addToCart(product)}
                            disabled={product.quantity <= 0}
                          >
                            {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
