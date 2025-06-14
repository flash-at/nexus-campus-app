
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, User, MapPin, Phone, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Order {
  id: string;
  status: string;
  total_price: number;
  service_fee: number;
  payment_method: string;
  pickup_deadline: string;
  qr_code: string;
  notes: string;
  created_at: string;
  users: {
    full_name: string;
    phone_number: string;
    email: string;
  };
  campus_order_items: {
    quantity: number;
    unit_price: number;
    subtotal: number;
    products: {
      name: string;
      image_url: string;
    };
  }[];
}

export const LiveOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    // Set up real-time subscription
    const subscription = supabase
      .channel('campus_orders_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'campus_orders'
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('campus_orders')
        .select(`
          *,
          users (full_name, phone_number, email),
          campus_order_items (
            quantity,
            unit_price,
            subtotal,
            products (name, image_url)
          )
        `)
        .in('status', ['placed', 'accepted', 'ready'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('campus_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: `Order ${status} successfully`,
      });
      
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-blue-500';
      case 'accepted': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case 'placed':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => updateOrderStatus(order.id, 'accepted')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateOrderStatus(order.id, 'cancelled')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, 'ready')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Mark Ready
          </Button>
        );
      case 'ready':
        return (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, 'completed')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <QrCode className="h-4 w-4 mr-1" />
            Complete Pickup
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
            <p className="text-muted-foreground">New orders will appear here</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Order #{order.id.slice(0, 8)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{order.total_price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {order.payment_method}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.users.full_name}</p>
                  <p className="text-sm text-muted-foreground">{order.users.phone_number}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-medium">Items:</h4>
                {order.campus_order_items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        {item.products.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.products.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ₹{item.unit_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold">₹{item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Special Instructions */}
              {order.notes && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
                  <p className="text-sm text-yellow-700">{order.notes}</p>
                </div>
              )}

              {/* Time Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Ordered {formatDistanceToNow(new Date(order.created_at))} ago</span>
                </div>
                {order.pickup_deadline && (
                  <div className="flex items-center gap-1">
                    <span>Pickup by: {new Date(order.pickup_deadline).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t">
                {getStatusActions(order)}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
