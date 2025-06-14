
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LiveOrdersProps {
  vendorId: string;
  onOrderUpdate: () => void;
}

const LiveOrders = ({ vendorId, onOrderUpdate }: LiveOrdersProps) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (vendorId) {
      fetchOrders();
    }
  }, [vendorId]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorId)
        .in('status', ['pending', 'accepted', 'preparing'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'accepted',
          pickup_timer_start: new Date().toISOString(),
          pickup_deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order accepted successfully!');
      fetchOrders();
      onOrderUpdate();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', decline_reason: 'Rejected by vendor' })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order rejected');
      fetchOrders();
      onOrderUpdate();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Live Orders</h2>
        <Badge variant="outline">{orders.length} pending</Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pending orders</h3>
            <p className="text-gray-500">New orders will appear here in real-time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Customer: {order.user_name} | {order.user_email}
                    </p>
                  </div>
                  <Badge 
                    variant={order.status === 'pending' ? 'destructive' : 'default'}
                    className="capitalize"
                  >
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Order Items:</h4>
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-semibold">
                    Total: ₹{order.total}
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Order
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleRejectOrder(order.id)}
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {order.status === 'accepted' && (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Ready
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveOrders;
