import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getAvailableVouchers, 
  redeemVoucher, 
  Voucher 
} from '@/services/pointsService';
import { VoucherCard } from '@/components/points/VoucherCard';
import { PointsHistoryCard } from '@/components/points/PointsHistoryCard';
import { usePoints } from '@/hooks/usePoints';
import { useAuth } from '@/hooks/useAuth';
import { Coins, Gift, TrendingUp, Star } from 'lucide-react';

export const Payments = () => {
  const { points, history, loading: pointsLoading } = usePoints(); // Updated to use correct property names
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const availableVouchers = await getAvailableVouchers();
      setVouchers(availableVouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const handleRedeemVoucher = async (voucherId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await redeemVoucher(voucherId, user.id); // Changed from user.uid to user.id
      await fetchVouchers();
    } catch (error) {
      console.error('Error redeeming voucher:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 mb-4">
            <Coins className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Rewards & Payments</h1>
          <p className="text-muted-foreground">Redeem your points for exclusive vouchers and rewards</p>
        </div>

        <Tabs defaultValue="vouchers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vouchers" className="text-sm font-medium">Available Vouchers</TabsTrigger>
            <TabsTrigger value="history" className="text-sm font-medium">Points History</TabsTrigger>
          </TabsList>
          <TabsContent value="vouchers" className="space-y-4">
            {vouchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vouchers.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    currentPoints={points}
                    onRedeem={handleRedeemVoucher}
                    loading={loading}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center p-6">
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <Gift className="w-10 h-10 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium">No vouchers available at the moment</p>
                  <p className="text-sm text-muted-foreground">Check back later for new rewards!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            <PointsHistoryCard transactions={history} loading={pointsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
