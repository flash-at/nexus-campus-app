
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, Plus, Minus, ShoppingCart, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  total: number;
  serviceFee: number;
}

const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, total, serviceFee }: CartProps) => {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const grandTotal = total + serviceFee;

  const placeOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Please login to place an order");
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_name: userData.user.user_metadata?.full_name || 'Student',
          user_email: userData.user.email,
          user_id: userData.user.id,
          service_type: 'campus_store',
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          subtotal: total,
          service_fee: serviceFee,
          total: grandTotal,
          status: 'pending',
          payment_method: 'wallet'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Generate QR code for pickup - simplified version
      const qrCode = `CC${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
      
      // For now, we'll store the QR code in the order itself until the pickup_confirmations table is available
      await supabase
        .from('orders')
        .update({ qr_code: qrCode })
        .eq('id', order.id);

      toast.success("Order placed successfully! You'll receive a notification when it's accepted.");
      
      // Clear cart and close
      items.forEach(item => onRemoveItem(item.id));
      onClose();
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-400">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-sm text-gray-500">₹{item.price} each</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-green-600">₹{item.price * item.quantity}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemoveItem(item.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee</span>
                  <Badge variant="secondary">₹{serviceFee}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-green-600">₹{grandTotal}</span>
                </div>
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={placeOrder}
                disabled={isPlacingOrder}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isPlacingOrder ? "Placing Order..." : `Place Order - ₹${grandTotal}`}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
