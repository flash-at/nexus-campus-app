
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Minus, Plus, Trash2, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  discount_percentage: number;
  quantity: number;
  vendor_id: string;
  vendors?: {
    business_name: string;
  };
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onBack: () => void;
  subtotal: number;
  serviceFee: number;
}

export const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onBack,
  subtotal,
  serviceFee
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { user, forceSessionSync, isSessionSyncing } = useAuth();
  const { toast } = useToast();

  const total = subtotal + serviceFee;

  // Group items by vendor
  const groupedItems = items.reduce((acc, item) => {
    const vendorId = item.vendor_id;
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor: item.vendors?.business_name || 'Unknown Vendor',
        items: []
      };
    }
    acc[vendorId].items.push(item);
    return acc;
  }, {} as Record<string, { vendor: string; items: CartItem[] }>);

  const handleRetrySession = async () => {
    console.log('[Cart] 🔄 Retrying session sync...');
    try {
      await forceSessionSync();
      toast({
        title: "Session Synced",
        description: "Authentication session has been refreshed. You can now place your order.",
      });
    } catch (error) {
      console.error('[Cart] ❌ Retry session failed:', error);
      toast({
        title: "Session Sync Failed",
        description: "Please try logging out and logging back in.",
        variant: "destructive"
      });
    }
  };

  const handlePlaceOrder = async () => {
    console.log('[Cart] 🛒 Place order triggered');
    console.log('[Cart] 📊 Auth state check:', {
      hasUser: !!user,
      firebaseUID: user?.uid,
      timestamp: new Date().toISOString()
    });

    if (!user) {
      console.log('[Cart] ❌ No Firebase user found');
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive"
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      console.log('[Cart] 🚀 Starting order placement process...');
      
      // Get Firebase ID token for authentication
      console.log('[Cart] 🔑 Getting Firebase ID token...');
      const idToken = await user.getIdToken();
      console.log('[Cart] ✅ Got Firebase ID token');

      // Create a temporary session with the Firebase token
      console.log('[Cart] 🔐 Setting up authentication with Firebase token...');
      
      // Create a temporary Supabase client with the Firebase JWT token
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseWithAuth = createClient(
        'https://rqhgakhmtbimsroydtnj.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaGdha2htdGJpbXNyb3lkdG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNjIzMTYsImV4cCI6MjA2NDgzODMxNn0.WFD3LLQx4iVuhrb7qct-TKF72NjskF5vWSqch_cfO30',
        {
          global: {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          },
        }
      );
      
      // First, get the user's UUID from the users table using their Firebase UID
      console.log('[Cart] 🔍 Looking up user UUID for Firebase UID:', user.uid);
      
      const { data: userData, error: userError } = await supabaseWithAuth
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();

      if (userError || !userData) {
        console.error('[Cart] ❌ Error finding user:', userError);
        toast({
          title: "User Error",
          description: "Could not find your user profile. Please try logging out and back in.",
          variant: "destructive"
        });
        return;
      }

      const userUuid = userData.id;
      console.log('[Cart] ✅ Found user UUID:', userUuid);

      for (const [vendorId, group] of Object.entries(groupedItems)) {
        console.log('[Cart] 🏪 Processing vendor:', vendorId);
        
        const vendorSubtotal = group.items.reduce((sum, item) => {
          const discountedPrice = item.price * (1 - item.discount_percentage / 100);
          return sum + (discountedPrice * item.quantity);
        }, 0);

        const vendorServiceFee = serviceFee / Object.keys(groupedItems).length;
        const qrCode = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log('[Cart] 📝 Creating order:', {
          student_id: userUuid,
          vendor_id: vendorId,
          total_price: vendorSubtotal + vendorServiceFee,
          service_fee: vendorServiceFee,
          payment_method: paymentMethod,
          qr_code: qrCode
        });

        const { data: orderData, error: orderError } = await supabaseWithAuth
          .from('campus_orders')
          .insert({
            student_id: userUuid,
            vendor_id: vendorId,
            total_price: vendorSubtotal + vendorServiceFee,
            service_fee: vendorServiceFee,
            payment_method: paymentMethod,
            qr_code: qrCode,
            notes: notes || null,
            pickup_deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (orderError) {
          console.error('[Cart] ❌ Error inserting into campus_orders:', orderError);
          throw orderError;
        }

        console.log('[Cart] ✅ Order created successfully:', orderData);

        const orderItems = group.items.map(item => ({
          order_id: orderData.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price * (1 - item.discount_percentage / 100),
          subtotal: (item.price * (1 - item.discount_percentage / 100)) * item.quantity
        }));

        console.log('[Cart] 📦 Adding order items:', orderItems);

        const { error: itemsError } = await supabaseWithAuth
          .from('campus_order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('[Cart] ❌ Error inserting campus_order_items:', itemsError);
          throw itemsError;
        }

        console.log('[Cart] ✅ Order items added successfully');
      }

      console.log('[Cart] 🎉 All orders placed successfully');

      toast({
        title: "Order Placed Successfully!",
        description: `Your order${Object.keys(groupedItems).length > 1 ? 's' : ''} ${Object.keys(groupedItems).length > 1 ? 'have' : 'has'} been placed. You'll receive updates as vendors accept your order.`,
      });

      items.forEach(item => onUpdateQuantity(item.id, 0));
      onBack();

    } catch (error: any) {
      const errorDesc =
        (error?.message || error?.description || "") +
        (error?.details ? ` (${error.details})` : "");
      console.error('[Cart] ❌ Error placing order:', error);
      toast({
        title: "Error",
        description: errorDesc || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Store
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to get started</p>
          <Button onClick={onBack}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Store
        </Button>

        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        {/* Session Status Warning */}
        {!user && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium text-orange-800">Authentication Required</p>
                  <p className="text-sm text-orange-700">Please log in to place an order.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetrySession}
                  disabled={isSessionSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSessionSyncing ? 'animate-spin' : ''}`} />
                  {isSessionSyncing ? 'Syncing...' : 'Sync Session'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {Object.entries(groupedItems).map(([vendorId, group]) => (
              <Card key={vendorId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <CardTitle className="text-lg">{group.vendor}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.items.map((item) => {
                    const discountedPrice = item.price * (1 - item.discount_percentage / 100);
                    const itemTotal = discountedPrice * item.quantity;

                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold">₹{discountedPrice.toFixed(2)}</span>
                            {item.discount_percentage > 0 && (
                              <>
                                <span className="text-sm text-muted-foreground line-through">
                                  ₹{item.price.toFixed(2)}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {item.discount_percentage}% OFF
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <p className="font-bold">₹{itemTotal.toFixed(2)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => onUpdateQuantity(item.id, 0)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>₹{serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      className="text-sm font-medium mb-2 block"
                      htmlFor="payment-method"
                    >
                      Payment Method
                    </label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      name="payment_method"
                    >
                      <SelectTrigger id="payment-method" name="payment_method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="wallet">Campus Wallet</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      className="text-sm font-medium mb-2 block"
                      htmlFor="special-instructions"
                    >
                      Special Instructions (Optional)
                    </label>
                    <Textarea
                      id="special-instructions"
                      name="special_instructions"
                      placeholder="Any special requests or instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !user}
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Orders will be split by vendor. You'll receive separate QR codes for each vendor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
