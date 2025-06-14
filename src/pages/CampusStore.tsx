
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Search, ShoppingCart, Star, Clock, MapPin, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StoreHeader from "@/components/store/StoreHeader";
import CategoryGrid from "@/components/store/CategoryGrid";
import ProductGrid from "@/components/store/ProductGrid";
import Cart from "@/components/store/Cart";
import OrderTracking from "@/components/store/OrderTracking";

const CampusStore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use mock data until the database tables are created
    setCategories([
      { id: 'food', name: 'Food & Beverages', description: 'Snacks, meals, and drinks', icon: 'utensils', display_order: 1 },
      { id: 'xerox', name: 'Xerox & Printing', description: 'Document printing and copying services', icon: 'printer', display_order: 2 },
      { id: 'stationery', name: 'Stationery', description: 'Notebooks, pens, and office supplies', icon: 'pencil', display_order: 3 },
      { id: 'electronics', name: 'Electronics', description: 'Gadgets and tech accessories', icon: 'smartphone', display_order: 4 },
      { id: 'merchandise', name: 'Merchandise', description: 'College branded items and apparel', icon: 'shirt', display_order: 5 },
      { id: 'essentials', name: 'Essentials', description: 'Daily necessities and personal care', icon: 'shopping-bag', display_order: 6 }
    ]);

    // Mock products
    setProducts([
      { id: '1', name: 'Samosa', price: 15, category_id: 'food', available: true, in_stock: true, description: 'Crispy fried samosa', image_url: null },
      { id: '2', name: 'Tea', price: 10, category_id: 'food', available: true, in_stock: true, description: 'Hot tea', image_url: null },
      { id: '3', name: 'A4 Printing', price: 2, category_id: 'xerox', available: true, in_stock: true, description: 'Single side A4 printing', image_url: null },
      { id: '4', name: 'Notebook', price: 50, category_id: 'stationery', available: true, in_stock: true, description: '200 pages notebook', image_url: null }
    ]);

    setIsLoading(false);
    fetchActiveOrders();
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userData.user.id)
        .in('status', ['pending', 'accepted', 'preparing', 'ready']);

      if (error) throw error;
      setActiveOrders(data || []);
    } catch (error) {
      console.error('Error fetching active orders:', error);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = cartTotal > 0 ? (cartTotal < 100 ? 5 : cartTotal < 500 ? 10 : 16) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StoreHeader 
        cartItemsCount={cartItems.length}
        onCartClick={() => setIsCartOpen(true)}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Active Orders</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeOrders.map(order => (
                <OrderTracking key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for food, stationery, electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Categories</h2>
          <CategoryGrid 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* Products */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedCategory === 'all' ? 'All Products' : 
               categories.find(c => c.id === selectedCategory)?.name || 'Products'}
            </h2>
            <Badge variant="secondary">
              {filteredProducts.length} items
            </Badge>
          </div>
          <ProductGrid 
            products={filteredProducts}
            onAddToCart={addToCart}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        total={cartTotal}
        serviceFee={serviceFee}
      />
    </div>
  );
};

export default CampusStore;
