
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PartnerHeader from "@/components/partner/PartnerHeader";
import LiveOrders from "@/components/partner/LiveOrders";
import ProductManagement from "@/components/partner/ProductManagement";
import Analytics from "@/components/partner/Analytics";
import StoreSettings from "@/components/partner/StoreSettings";

const PartnerDashboard = () => {
  const [vendorData, setVendorData] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isStoreActive, setIsStoreActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVendorData();
    fetchPendingOrders();
    
    // Subscribe to real-time order updates
    const ordersSubscription = supabase
      .channel('partner-orders')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        console.log('New order received:', payload);
        fetchPendingOrders();
        toast.success('New order received!');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const fetchVendorData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('firebase_uid', userData.user.id)
        .single();

      if (error) throw error;
      setVendorData(data);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Failed to load vendor data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      if (!vendorData?.id) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingOrders(data || []);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PartnerHeader 
        vendorData={vendorData}
        isStoreActive={isStoreActive}
        onToggleStore={setIsStoreActive}
        pendingOrdersCount={pendingOrders.length}
      />

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="relative">
              Live Orders
              {pendingOrders.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                  {pendingOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <LiveOrders 
              vendorId={vendorData?.id}
              onOrderUpdate={fetchPendingOrders}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement vendorId={vendorData?.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics vendorId={vendorData?.id} />
          </TabsContent>

          <TabsContent value="settings">
            <StoreSettings 
              vendorData={vendorData}
              onUpdate={fetchVendorData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerDashboard;
