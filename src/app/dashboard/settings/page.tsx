"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Globe,
  Bell,
  Shield,
  Database,
  Save,
  Download,
  Upload,
  Key
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Store Settings
    storeName: "Dual Store",
    storeEmail: "admin@dualstore.com",
    storePhone: "628123456789",
    storeDescription: "Multi-store e-commerce platform for Indonesian market",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    customerNotifications: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 24,

    // Theme Settings
    darkMode: false,
    compactMode: false,

    // API Settings
    apiKeyEnabled: true,
    webhookUrl: "",

    // Backup Settings
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: 30
  });

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleSettingChange(key, e.target.value);
  };

  const handleSwitchChange = (key: string) => (checked: boolean) => {
    handleSettingChange(key, checked);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Settings saved:", settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your store settings and preferences
        </p>
      </div>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Store Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={handleInputChange("storeName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Store Email</Label>
              <Input
                id="storeEmail"
                type="email"
                value={settings.storeEmail}
                onChange={handleInputChange("storeEmail")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storePhone">Store Phone</Label>
            <Input
              id="storePhone"
              value={settings.storePhone}
              onChange={handleInputChange("storePhone")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeDescription">Store Description</Label>
            <Textarea
              id="storeDescription"
              value={settings.storeDescription}
              onChange={handleInputChange("storeDescription")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {session?.user?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{session?.user?.name || "Admin User"}</h3>
              <p className="text-sm text-gray-600">{session?.user?.email}</p>
              <Badge variant="secondary" className="mt-1">
                {session?.user?.role || "OWNER"}
              </Badge>
            </div>
            <Button variant="outline">
              Edit Profile
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email Address</Label>
              <Input
                id="userEmail"
                type="email"
                value={session?.user?.email || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userRole">Role</Label>
              <Input
                id="userRole"
                value={session?.user?.role || "OWNER"}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive email updates about your store</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={handleSwitchChange("emailNotifications")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive SMS updates for important events</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={handleSwitchChange("smsNotifications")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Order Notifications</Label>
              <p className="text-sm text-gray-500">Get notified when new orders are placed</p>
            </div>
            <Switch
              checked={settings.orderNotifications}
              onCheckedChange={handleSwitchChange("orderNotifications")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Customer Notifications</Label>
              <p className="text-sm text-gray-500">Notifications about new customer registrations</p>
            </div>
            <Switch
              checked={settings.customerNotifications}
              onCheckedChange={handleSwitchChange("customerNotifications")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={handleSwitchChange("twoFactorAuth")}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Session Timeout (hours)</Label>
            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange("sessionTimeout", parseInt(e.target.value))}
              min="1"
              max="168"
            />
            <p className="text-sm text-gray-500">Automatically log out after period of inactivity</p>
          </div>

          <Separator />

          <Button variant="outline" className="w-full justify-start">
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>API Access</Label>
              <p className="text-sm text-gray-500">Enable API access for third-party integrations</p>
            </div>
            <Switch
              checked={settings.apiKeyEnabled}
              onCheckedChange={handleSwitchChange("apiKeyEnabled")}
            />
          </div>

          {settings.apiKeyEnabled && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value={settings.webhookUrl}
                  onChange={(e) => handleSettingChange("webhookUrl", e.target.value)}
                  placeholder="https://your-webhook-url.com"
                />
                <p className="text-sm text-gray-500">Receive real-time updates about orders and customers</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Backup Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Automatic Backups</Label>
              <p className="text-sm text-gray-500">Automatically backup your store data</p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={handleSwitchChange("autoBackup")}
            />
          </div>

          {settings.autoBackup && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => handleSettingChange("backupFrequency", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Retention Days</Label>
                  <Input
                    type="number"
                    value={settings.retentionDays}
                    onChange={(e) => handleSettingChange("retentionDays", parseInt(e.target.value))}
                    min="7"
                    max="365"
                  />
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download Backup</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Restore Backup</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}