
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePoints } from "@/hooks/usePoints";
import { supabase } from "@/integrations/supabase/client";
import { 
  getAvailableVouchers, 
  getUserRedemptions, 
  redeemVoucher,
  Voucher,
  VoucherRedemption 
} from "@/services/pointsService";
import { VoucherCard } from "@/components/points/VoucherCard";
import { Gift, History, Coins } from "lucide-react";
import { toast } from "sonner";

export default function Payments() {
  const { user } = useAuth();
  const { currentPoints, refetch: refetchPoints } = usePoints();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [redemptions, setRedemptions] = useState<VoucherRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get available vouchers
      const availableVouchers = await getAvailableVouchers();
      setVouchers(availableVouchers);

      // Get user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();

      if (userData) {
        // Get user's redemptions
        const userRedemptions = await getUserRedemptions(userData.id);
        setRedemptions(userRedemptions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load vouchers and redemptions');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (voucherId: string) => {
    if (!user) return;

    try {
      setRedeeming(voucherId);

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

      const result = await redeemVoucher(voucherId, userData.id);

      if (result.success) {
        toast.success('Voucher redeemed successfully!');
        // Refresh data
        await fetchData();
        await refetchPoints();
      } else {
        toast.error(result.error || 'Failed to redeem voucher');
      }
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      toast.error('An error occurred while redeeming the voucher');
    } finally {
      setRedeeming(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please log in to view vouchers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Points Balance Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            <span>Your Points Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {currentPoints.toLocaleString()} points
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Redeem points for exciting vouchers and rewards
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="vouchers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vouchers" className="flex items-center space-x-2">
            <Gift className="w-4 h-4" />
            <span>Available Vouchers</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>My Redemptions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : vouchers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No vouchers available at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  currentPoints={currentPoints}
                  onRedeem={handleRedeem}
                  loading={redeeming === voucher.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : redemptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">You haven't redeemed any vouchers yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start earning points and redeem exciting vouchers!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {redemptions.map((redemption) => (
                <Card key={redemption.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {redemption.voucher?.title || 'Unknown Voucher'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Redemption Code: <span className="font-mono">{redemption.redemption_code}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Redeemed on {new Date(redemption.redeemed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={redemption.status === 'active' ? 'default' : 'secondary'}>
                          {redemption.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {redemption.points_spent} points
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
