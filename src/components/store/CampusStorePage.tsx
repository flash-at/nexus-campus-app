import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Star, Clock, MapPin, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Cart } from './Cart';
import { ProductDetails } from './ProductDetails';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
}

interface Vendor {
  id: string;
  business_name: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number;
  quantity: number;
  image_url: string;
  available_from: string;
  available_until: string;
  vendor_id: string;
  category_id: string;
  vendor?: Vendor;
}

export const CampusStorePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // REMOVE THE addSampleDataIfNeeded function – this is not needed in production
  // useEffect(() => {
  //   initializeData();
  // }, []);

  useEffect(() => {
    // On mount, fetch all
    initializeData();
  }, []);

  // Remove custom sample seed logic, just load everything from DB
  const initializeData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchCategories(), fetchProducts()]);
    } catch (error) {
      setError('Failed to load store data. Please try again.');
      console.error('[CampusStorePage] initializeData error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clean fetchCategories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('store_categories')
        .select('*')
        .eq('active', true)
        .order('display_order');
      if (error) throw error;
      setCategories(data ?? []);
      if (!data || data.length === 0) {
        setError('No categories found.');
      }
    } catch (error) {
      setError('Failed to load categories.');
      setCategories([]);
      console.error('[CampusStorePage] Error fetching categories:', error);
    }
  };

  // Clean fetchProducts and clarify vendor mapping logic
  const fetchProducts = async () => {
    try {
      // 1. Fetch all products
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (productsError) throw productsError;
      if (!allProducts || allProducts.length === 0) {
        setProducts([]);
        setError('No products are currently available.');
        return;
      }

      // 2. Fetch vendors
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .eq('status', 'approved');
      if (vendorsError) throw vendorsError;

      // 3. Map vendorId => vendor
      const vendorMap: Record<string, Vendor> = {};
      (vendors ?? []).forEach((vendor) => {
        vendorMap[vendor.id] = vendor;
      });

      // 4. Apply category and search filters (robust)
      let filteredProducts = [...allProducts];
      if (selectedCategory) {
        filteredProducts = filteredProducts.filter(p => p.category_id === selectedCategory);
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name?.toLowerCase().includes(query) ||
          (product.description?.toLowerCase().includes(query))
        );
      }

      // 5. Map vendor objects for display, fallback to "Campus Store"
      const productsWithVendors = filteredProducts.map(product => ({
        ...product,
        vendor: vendorMap[product.vendor_id] ?? { business_name: "Campus Store", status: "approved", id: "" }
      }));

      setProducts(productsWithVendors);

      if (filteredProducts.length === 0) {
        setError('No products found matching your search or filters.');
      } else {
        setError(null);
      }
    } catch (error) {
      setError('Failed to load products. Please try again.');
      setProducts([]);
      console.error('[CampusStorePage] Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    // fetchCategories(); // Optionally, reload categories if filters depend
    // Only re-fetch products when filter/search changes
  }, [selectedCategory, searchQuery]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
    }

    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart`,
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== productId));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const discountedPrice = item.price * (1 - item.discount_percentage / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getServiceFee = (subtotal: number) => {
    if (subtotal < 100) return 5;
    if (subtotal < 300) return 8;
    if (subtotal < 500) return 12;
    return 16;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to access the Campus Store</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCart) {
    return (
      <Cart
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onBack={() => setShowCart(false)}
        subtotal={getCartTotal()}
        serviceFee={getServiceFee(getCartTotal())}
      />
    );
  }

  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Campus Store</h1>
            <Button
              variant="outline"
              size="sm"
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

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Categories</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === '' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={initializeData}>Try Again</Button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const discountedPrice = product.price * (1 - product.discount_percentage / 100);
              const isAvailable = product.quantity > 0;

              return (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${!isAvailable ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative">
                    <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>
                    {product.discount_percentage > 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                        {product.discount_percentage}% OFF
                      </Badge>
                    )}
                    {!isAvailable && (
                      <Badge className="absolute top-2 left-2 bg-gray-500">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{product.vendor?.business_name || 'Campus Store'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">₹{discountedPrice.toFixed(2)}</span>
                        {product.discount_percentage > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        disabled={!isAvailable}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              {selectedCategory || searchQuery 
                ? "Try adjusting your search or category filter"
                : "Check back later for new products"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
