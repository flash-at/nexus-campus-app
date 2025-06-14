
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Settings, Store } from "lucide-react";

interface PartnerHeaderProps {
  vendorData: any;
  isStoreActive: boolean;
  onToggleStore: (active: boolean) => void;
  pendingOrdersCount: number;
}

const PartnerHeader = ({ vendorData, isStoreActive, onToggleStore, pendingOrdersCount }: PartnerHeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {vendorData?.business_name || 'Partner Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">{vendorData?.category}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Store Active</span>
              <Switch
                checked={isStoreActive}
                onCheckedChange={onToggleStore}
              />
            </div>
            
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {pendingOrdersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {pendingOrdersCount}
                </Badge>
              )}
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PartnerHeader;
