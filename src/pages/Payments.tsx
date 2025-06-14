
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PointsHistoryCard } from "@/components/points/PointsHistoryCard";
import { VoucherCard } from "@/components/points/VoucherCard";
import { usePoints } from "@/hooks/usePoints";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  getAvailableVouchers, 
  getUserRedemptions, 
  redeemVoucher,
  Voucher,
  VoucherRedemption 
} from "@/services/pointsService";
import { toast } from "sonner";
import { Wallet, Gift, History, Star, Trophy, RefreshCw } from "lucide-react";

export default function Payments() {
  const { user } = useAuth();
  const { currentPoints, pointsHistory, loading: pointsLoading, refetch: refetchPoints } = usePoints();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [redemptions, setRedemptions] = useState<VoucherRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [vouchersData, redemptionsData] = await Promise.all([
        getAvailableVouchers(),
        user ? getUserRedemptions(user.uid) : Promise.resolve([])
      ]);
      
      setVouchers(vouchersData);
      setRedemptions(redemptionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRedeemVoucher = async (voucherId: string) => {
    if (!user) {
      toast.error('Please login to redeem vouchers');
      return;
    }

    // Get user's internal ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', user.uid)
      .single();

    if (!userData) {
      toast.error('User not found');
      return;
    }

    try {
      setRedeeming(voucherId);
      
      const result = await redeemVoucher(voucherId, userData.id);
      
      if (result.success) {
        toast.success('Voucher redeemed successfully!', {
          description: `Your redemption code is: ${result.redemption?.redemption_code}`
        });
        
        // Refresh data
        await Promise.all([
          fetchData(),
          refetchPoints()
        ]);
      } else {
        toast.error(result.error || 'Failed to redeem voucher');
      }
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Campus Wallet</h1>
          <p className="text-muted-foreground">Redeem your activity points for exciting rewards</p>
        </div>
        <Button 
          onClick={() => Promise.all([fetchData(), refetchPoints()])}
          variant="outline"
          size="sm"
          disabled={loading || pointsLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading || pointsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Points Overview */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Wallet className="w-6 h-6 mr-3" />
            Your Points Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{currentPoints}</div>
              <div className="text-blue-100">Activity Points Available</div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="text-lg">Level {Math.floor(currentPoints / 100) + 1}</span>
              </div>
              <div className="text-blue-100 text-sm">
                {100 - (currentPoints % 100)} points to next level
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="vouchers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vouchers" className="flex items-center space-x-2">
            <Gift className="w-4 h-4" />
            <span>Vouchers</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Points History</span>
          </TabsTrigger>
          <TabsTrigger value="redemptions" className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>My Redemptions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : vouchers.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Vouchers Available</h3>
                  <p className="text-muted-foreground">Check back later for exciting rewards!</p>
                </CardContent>
              </Card>
            ) : (
              vouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  currentPoints={currentPoints}
                  onRedeem={handleRedeemVoucher}
                  loading={redeeming === voucher.id}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <PointsHistoryCard 
            transactions={pointsHistory} 
            loading={pointsLoading}
          />
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                My Redemptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {redemptions.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Redemptions Yet</h3>
                  <p className="text-muted-foreground">Start redeeming vouchers to see them here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {redemptions.map((redemption) => (
                    <div key={redemption.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{redemption.voucher?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Redeemed on {new Date(redemption.redeemed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={redemption.status === 'active' ? 'default' : 'secondary'}>
                          {redemption.status}
                        </Badge>
                      </div>
                      
                      <div className="bg-muted p-3 rounded text-center">
                        <div className="text-xs text-muted-foreground mb-1">Redemption Code</div>
                        <div className="font-mono text-lg font-bold">{redemption.redemption_code}</div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Points Spent: <strong>{redemption.points_spent}</strong></span>
                        <span>Expires: <strong>{new Date(redemption.expires_at).toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
