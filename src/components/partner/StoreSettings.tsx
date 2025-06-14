
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface StoreSettingsProps {
  vendorData: any;
  onUpdate: () => void;
}

const StoreSettings = ({ vendorData, onUpdate }: StoreSettingsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Store Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={vendorData?.business_name || ''}
                placeholder="Enter business name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={vendorData?.category || ''}
                placeholder="Enter category"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={vendorData?.description || ''}
              placeholder="Describe your business"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-accept orders</Label>
              <p className="text-sm text-gray-500">Automatically accept new orders</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Accept pre-orders</Label>
              <p className="text-sm text-gray-500">Allow customers to place future orders</p>
            </div>
            <Switch />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prepTime">Default preparation time (minutes)</Label>
            <Input
              id="prepTime"
              type="number"
              placeholder="15"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email notifications</Label>
              <p className="text-sm text-gray-500">Receive order updates via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS notifications</Label>
              <p className="text-sm text-gray-500">Receive order updates via SMS</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-green-600 hover:bg-green-700">
        Save Settings
      </Button>
    </div>
  );
};

export default StoreSettings;
