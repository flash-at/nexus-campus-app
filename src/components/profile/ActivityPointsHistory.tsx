
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, TrendingUp, TrendingDown, Award } from "lucide-react";
import { getActivityPointsHistory, ActivityPointsTransaction, POINT_RULES } from "@/services/activityPointsService";
import { useUserProfile } from "@/hooks/useUserProfile";

export const ActivityPointsHistory = () => {
  const { profile } = useUserProfile();
  const [history, setHistory] = useState<ActivityPointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      try {
        const historyData = await getActivityPointsHistory(profile.id);
        setHistory(historyData);
      } catch (error) {
        console.error('Error fetching activity points history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [profile?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (transactionType: string, points: number) => {
    if (transactionType === 'earned' || points > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTransactionColor = (transactionType: string, points: number) => {
    if (transactionType === 'earned' || points > 0) {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          Activity Points History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Points Rules Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200/30">
          <h4 className="font-semibold mb-3 flex items-center">
            <Award className="h-4 w-4 mr-2 text-primary" />
            Points System
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Account Creation:</span>
              <Badge variant="outline" className="text-green-600">+{POINT_RULES.ACCOUNT_CREATION}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Feedback Submission:</span>
              <Badge variant="outline" className="text-green-600">+{POINT_RULES.FEEDBACK_SUBMISSION}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Feedback Hero (5+):</span>
              <Badge variant="outline" className="text-green-600">+{POINT_RULES.FEEDBACK_HERO}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Workshop Attendance:</span>
              <Badge variant="outline" className="text-green-600">+{POINT_RULES.WORKSHOP_ATTENDANCE}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Club Join:</span>
              <Badge variant="outline" className="text-green-600">+{POINT_RULES.CLUB_JOIN}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Club Leave Cost:</span>
              <Badge variant="outline" className="text-red-600">-{POINT_RULES.CLUB_LEAVE_COST}</Badge>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            <p>• Students must stay in clubs for {POINT_RULES.MINIMUM_CLUB_DAYS} days before leaving</p>
            <p>• Feedback Hero badge awarded for 5+ feedback submissions</p>
          </div>
        </div>

        {/* Transaction History */}
        <ScrollArea className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-3">
              {history.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.transaction_type, transaction.points)}
                    <div>
                      <p className="font-medium text-sm">{transaction.reason}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${getTransactionColor(transaction.transaction_type, transaction.points)}`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </span>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity points history yet.</p>
              <p className="text-sm">Start earning points by participating in activities!</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
