
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, CheckCircle, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  status: string;
  total: number;
  service_fee: number;
  pickup_timer_start?: string;
  pickup_deadline?: string;
  created_at: string;
  items: any[];
  qr_code?: string;
}

interface OrderTrackingProps {
  order: Order;
}

const OrderTracking = ({ order }: OrderTrackingProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (order.pickup_deadline) {
      const timer = setInterval(() => {
        const deadline = new Date(order.pickup_deadline!).getTime();
        const now = new Date().getTime();
        const difference = deadline - now;

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining("Expired");
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order.pickup_deadline]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';
      case 'completed': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting for vendor acceptance';
      case 'accepted': return 'Order accepted - being prepared';
      case 'preparing': return 'Your order is being prepared';
      case 'ready': return 'Ready for pickup!';
      case 'completed': return 'Order completed';
      default: return status;
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
          <Badge className={`${getStatusColor(order.status)} text-white`}>
            {order.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{getStatusText(order.status)}</span>
        </div>

        {order.pickup_deadline && timeRemaining && (
          <div className={`p-3 rounded-lg ${timeRemaining === "Expired" ? "bg-red-50 dark:bg-red-950" : "bg-green-50 dark:bg-green-950"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pickup Time Remaining:</span>
              <span className={`font-mono font-bold ${timeRemaining === "Expired" ? "text-red-600" : "text-green-600"}`}>
                {timeRemaining}
              </span>
            </div>
          </div>
        )}

        <div className="text-sm">
          <div className="flex justify-between mb-1">
            <span>Items:</span>
            <span>{order.items?.length || 0}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {order.status === 'ready' && order.qr_code && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <QrCode className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium mb-2">Show this code for pickup:</p>
            <p className="font-mono text-lg font-bold text-green-600">{order.qr_code}</p>
          </div>
        )}

        {order.status === 'completed' && (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Order completed successfully!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTracking;
