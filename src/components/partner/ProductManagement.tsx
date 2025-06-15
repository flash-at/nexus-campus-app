
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';

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

export const ProductManagement = () => {
  const { partner } = usePartnerAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', discount: '', quantity: '', category_id: ''
  });

  // Fetch all categories for selecting when adding product
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (partner?.id) fetchProducts();
    fetchCategories();
  }, [partner?.id]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('store_categories')
      .select('id,name')
      .eq('active', true)
      .order('display_order');
    if (!error && data) setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    if (partner?.id) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', partner.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner?.id) return alert("Not authorized");
    if (!form.name || !form.price || !form.category_id) return alert("Name, price, and category required");

    const { error } = await supabase.from('products').insert([{
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discount_percentage: Number(form.discount || 0),
      quantity: Number(form.quantity || 1),
      vendor_id: partner.id,
      category_id: form.category_id,
      is_active: true
    }]);
    if (error) return alert('Failed to add product');
    setAddMode(false);
    setForm({ name: '', description: '', price: '', discount: '', quantity: '', category_id: '' });
    fetchProducts();
  };

  const removeProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').update({ is_active: false }).eq('id', id);
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Your Products</h3>
        <Button onClick={() => setAddMode(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>
      {addMode && (
        <form onSubmit={handleAdd} className="mb-4 space-y-2 bg-muted p-4 rounded">
          <Input
            placeholder="Product Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <Input
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            required
          />
          <Input
            placeholder="Discount (%)"
            type="number"
            value={form.discount}
            onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
          />
          <Input
            placeholder="Quantity"
            type="number"
            value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
          />
          <select
            className="w-full p-2 rounded border"
            required
            value={form.category_id}
            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="ghost" onClick={() => setAddMode(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-muted-foreground">No products yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(p => (
            <Card key={p.id}>
              <div className="h-36 bg-muted flex items-center justify-center rounded-t overflow-hidden">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  : <span className="text-3xl">📦</span>
                }
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold">{p.name}</h4>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-2 mb-1 flex gap-2 items-center">
                  <span className="font-bold">₹{p.price}</span>
                  {p.discount_percentage > 0 && (
                    <span className="ml-1 text-xs text-red-500">{p.discount_percentage}% off</span>
                  )}
                </div>
                <span className="text-xs text-green-700">{p.quantity} in stock</span>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProduct(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
