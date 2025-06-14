import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, Package, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

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
  is_active: boolean;
  category_id: string;
  store_categories: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentVendor, setCurrentVendor] = useState<any>(null);
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_percentage: '',
    quantity: '',
    image_url: '',
    available_from: '09:00',
    available_until: '17:00',
    category_id: '',
    is_active: true
  });

  // Helper: Try to sync Supabase session with Firebase current user if missing
  const ensureSupabaseSession = async (): Promise<boolean> => {
    const sessionResult = await supabase.auth.getSession();
    if (!sessionResult?.data?.session || !sessionResult.data.session.user) {
      if (user) {
        console.log("[VendorDebug] Missing Supabase session, attempting to restore using Firebase ID token...");
        const idToken = await user.getIdToken();
        const { error: supaAuthError } = await supabase.auth.signInWithIdToken({
          provider: 'firebase',
          token: idToken,
        });
        if (supaAuthError) {
          console.error("[VendorDebug] Failed to re-auth Supabase:", supaAuthError);
          setVendorError("Authentication session error. Please ensure Firebase is a configured OIDC provider in your Supabase project's Auth settings.");
          return false;
        } else {
          console.log("[VendorDebug] Supabase session restored successfully!");
          return true;
        }
      } else {
        console.warn("[VendorDebug] No Firebase user available for re-authentication.");
        setVendorError("Cannot verify session: No active user found.");
        return false;
      }
    }
    return true; // Session was already valid
  };

  useEffect(() => {
    if (user) {
      fetchCurrentVendor();
      fetchCategories();
    }
  }, [user, retryCount]);

  useEffect(() => {
    if (currentVendor) {
      fetchProducts();
    }
  }, [currentVendor]);

  const fetchCurrentVendor = async () => {
    if (!user) return;
    
    try {
      setVendorError(null);
      setLoading(true);

      console.log("[VendorDebug] Starting vendor sync for Firebase UID:", user.uid);

      // CRITICAL: Ensure we have a valid Supabase session before proceeding
      const isSessionValid = await ensureSupabaseSession();
      if (!isSessionValid) {
        // ensureSupabaseSession has already set the specific error message
        setLoading(false);
        return;
      }
      
      // Now that session is confirmed, try to fetch the vendor
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('firebase_uid', user.uid)
        .maybeSingle();
      console.log("[VendorDebug] Vendor fetch result:", { data, error });

      if (error) {
        console.error('[VendorDebug] Error fetching vendor:', error);
        setVendorError('Unable to load vendor account. Please try refreshing the page.');
        return;
      }
      
      if (data) {
        // Vendor exists
        if (data.status !== 'approved') {
          setVendorError('Your vendor account is pending approval.');
        } else {
          setCurrentVendor(data);
        }
        return;
      }

      // Vendor does not exist, so let's create it.
      // We already know the session is valid from the check above.
      console.log("[VendorDebug] No vendor found, attempting to insert record with firebase_uid:", user.uid);

      const { data: newVendor, error: createError } = await supabase
        .from('vendors')
        .insert({
          firebase_uid: user.uid,
          business_name: 'Partner Business',
          category: 'Food & Beverages',
          description: 'Campus service provider',
          status: 'approved'
        })
        .select()
        .single();

      console.log("[VendorDebug] Vendor insert result:", { newVendor, createError });

      if (createError) {
        console.error('[VendorDebug] Error creating vendor:', createError);
        setVendorError(`Failed to create vendor account: ${createError.message}`);
        return;
      }
      
      setCurrentVendor(newVendor);
      toast({ title: "Vendor account created successfully!" });

    } catch (error) {
      console.error('[VendorDebug] Exception in fetchCurrentVendor:', error);
      setVendorError('An unexpected error occurred while setting up your vendor account.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const fetchProducts = async () => {
    if (!currentVendor) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          store_categories (name)
        `)
        .eq('vendor_id', currentVendor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('store_categories')
        .select('id, name')
        .eq('active', true)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_percentage: '',
      quantity: '',
      image_url: '',
      available_from: '09:00',
      available_until: '17:00',
      category_id: '',
      is_active: true
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentVendor) {
      toast({
        title: "Error",
        description: "Vendor account not found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        quantity: parseInt(formData.quantity),
        image_url: formData.image_url || null,
        available_from: formData.available_from,
        available_until: formData.available_until,
        category_id: formData.category_id,
        is_active: formData.is_active,
        vendor_id: currentVendor.id
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast({ title: "Product updated successfully!" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        
        if (error) throw error;
        toast({ title: "Product added successfully! It will now appear in the Campus Store." });
      }

      setShowAddDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      discount_percentage: product.discount_percentage.toString(),
      quantity: product.quantity.toString(),
      image_url: product.image_url || '',
      available_from: product.available_from || '09:00',
      available_until: product.available_until || '17:00',
      category_id: product.category_id,
      is_active: product.is_active
    });
    setEditingProduct(product);
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? It will be removed from the Campus Store.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Product deleted successfully!" });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast({
        title: !currentStatus ? "Product activated" : "Product deactivated",
        description: !currentStatus 
          ? "Product is now visible in the Campus Store" 
          : "Product is now hidden from the Campus Store"
      });
      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading vendor account...</p>
        </div>
      </div>
    );
  }

  if (vendorError || !currentVendor) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h3 className="text-lg font-semibold mb-2">Vendor Account Issue</h3>
        <p className="text-muted-foreground mb-4">
          {vendorError || 'Unable to access vendor account'}
        </p>
        {vendorError?.includes("Firebase") && (
           <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            To fix this, go to your Supabase project's Authentication settings, add a new OIDC Provider, and configure it with your Firebase project details.
          </p>
        )}
        <Button onClick={handleRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">Add products that will be visible to students in the Campus Store</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Stock Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="available_from">Available From</Label>
                  <Input
                    id="available_from"
                    type="time"
                    value={formData.available_from}
                    onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="available_until">Available Until</Label>
                  <Input
                    id="available_until"
                    type="time"
                    value={formData.available_until}
                    onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Make product visible in Campus Store</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const discountedPrice = product.price * (1 - product.discount_percentage / 100);
          
          return (
            <Card key={product.id} className={!product.is_active ? 'opacity-60' : ''}>
              <div className="relative">
                <div className="h-48 bg-muted flex items-center justify-center rounded-t-lg">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {product.discount_percentage > 0 && (
                    <Badge className="bg-red-500">{product.discount_percentage}% OFF</Badge>
                  )}
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? 'Visible' : 'Hidden'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {product.store_categories?.name}
                </p>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">₹{discountedPrice.toFixed(2)}</span>
                    {product.discount_percentage > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline">Stock: {product.quantity}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  Available: {product.available_from} - {product.available_until}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleProductStatus(product.id, product.is_active)}
                  >
                    <Switch checked={product.is_active} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first product to the Campus Store</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Product
          </Button>
        </div>
      )}
    </div>
  );
};
