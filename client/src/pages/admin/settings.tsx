import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Building, Mail, Bell, Shield, Globe, Palette, Database, Key, Upload, Download, Save, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type SystemSettings = {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    supportEmail: string;
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;
    timeFormat: string;
  };
  branding: {
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    customCSS: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    useSSL: boolean;
    isEnabled: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    digestFrequency: string;
    adminNotifications: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requirePasswordChange: boolean;
    allowSelfRegistration: boolean;
    emailVerificationRequired: boolean;
  };
  payment: {
    paymentGateway: string;
    stripePublishableKey: string;
    stripeSecretKey: string;
    paypalClientId: string;
    paypalClientSecret: string;
    currency: string;
    taxRate: number;
  };
  storage: {
    maxFileSize: number;
    allowedFileTypes: string[];
    storageProvider: string;
    s3Bucket: string;
    s3Region: string;
    s3AccessKey: string;
    s3SecretKey: string;
  };
  api: {
    rateLimit: number;
    enableCors: boolean;
    corsOrigins: string;
    apiKey: string;
    webhookSecret: string;
  };
};

const mockSettings: SystemSettings = {
  general: {
    siteName: "Mentor Learning Platform",
    siteDescription: "Premium online learning platform for students and professionals",
    adminEmail: "admin@mentor.com",
    supportEmail: "support@mentor.com",
    timezone: "UTC",
    language: "en",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h"
  },
  branding: {
    logo: "/logo.png",
    favicon: "/favicon.ico",
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    fontFamily: "Inter",
    customCSS: ""
  },
  email: {
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "noreply@mentor.com",
    smtpPassword: "********",
    fromEmail: "noreply@mentor.com",
    fromName: "Mentor Platform",
    useSSL: true,
    isEnabled: true
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    digestFrequency: "daily",
    adminNotifications: true
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requirePasswordChange: false,
    allowSelfRegistration: true,
    emailVerificationRequired: true
  },
  payment: {
    paymentGateway: "stripe",
    stripePublishableKey: "pk_test_...",
    stripeSecretKey: "sk_test_...",
    paypalClientId: "",
    paypalClientSecret: "",
    currency: "USD",
    taxRate: 0.08
  },
  storage: {
    maxFileSize: 100,
    allowedFileTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "mp4", "webm"],
    storageProvider: "local",
    s3Bucket: "",
    s3Region: "us-east-1",
    s3AccessKey: "",
    s3SecretKey: ""
  },
  api: {
    rateLimit: 100,
    enableCors: true,
    corsOrigins: "https://mentor.com",
    apiKey: "api_key_...",
    webhookSecret: "webhook_secret_..."
  }
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>(mockSettings);
  const [activeTab, setActiveTab] = useState("general");
  const queryClient = useQueryClient();

  // Mock API calls
  const { isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = mockSettings;
      setSettings(data);
      return data;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({
        title: "Settings updated successfully",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (type: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return type;
    },
    onSuccess: (type) => {
      toast({
        title: "Connection test successful",
        description: `${type} connection is working properly.`,
      });
    },
    onError: () => {
      toast({
        title: "Connection test failed",
        description: "Please check your configuration and try again.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleTestConnection = (type: string) => {
    testConnectionMutation.mutate(type);
  };

  const updateSetting = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="text-center py-8">Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">System Settings</h1>
          </div>
          <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>General Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.general.adminEmail}
                      onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.general.timezone} onValueChange={(value) => updateSetting('general', 'timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.general.language} onValueChange={(value) => updateSetting('general', 'language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={settings.general.currency} onValueChange={(value) => updateSetting('general', 'currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={settings.general.dateFormat} onValueChange={(value) => updateSetting('general', 'dateFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Branding & Appearance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      value={settings.branding.logo}
                      onChange={(e) => updateSetting('branding', 'logo', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="favicon">Favicon URL</Label>
                    <Input
                      id="favicon"
                      value={settings.branding.favicon}
                      onChange={(e) => updateSetting('branding', 'favicon', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primaryColor"
                        value={settings.branding.primaryColor}
                        onChange={(e) => updateSetting('branding', 'primaryColor', e.target.value)}
                      />
                      <div 
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: settings.branding.primaryColor }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="secondaryColor"
                        value={settings.branding.secondaryColor}
                        onChange={(e) => updateSetting('branding', 'secondaryColor', e.target.value)}
                      />
                      <div 
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: settings.branding.secondaryColor }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select value={settings.branding.fontFamily} onValueChange={(value) => updateSetting('branding', 'fontFamily', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customCSS">Custom CSS</Label>
                  <Textarea
                    id="customCSS"
                    value={settings.branding.customCSS}
                    onChange={(e) => updateSetting('branding', 'customCSS', e.target.value)}
                    rows={6}
                    placeholder="Enter custom CSS..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Email Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailEnabled"
                    checked={settings.email.isEnabled}
                    onCheckedChange={(checked) => updateSetting('email', 'isEnabled', checked)}
                  />
                  <Label htmlFor="emailEnabled">Enable Email Service</Label>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.email.smtpHost}
                      onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={settings.email.smtpUser}
                      onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={settings.email.fromName}
                      onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="useSSL"
                    checked={settings.email.useSSL}
                    onCheckedChange={(checked) => updateSetting('email', 'useSSL', checked)}
                  />
                  <Label htmlFor="useSSL">Use SSL/TLS</Label>
                </div>

                <Button 
                  onClick={() => handleTestConnection('Email')}
                  disabled={testConnectionMutation.isPending}
                  variant="outline"
                >
                  {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                    />
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smsNotifications"
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                    />
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pushNotifications"
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                    />
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="adminNotifications"
                      checked={settings.notifications.adminNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'adminNotifications', checked)}
                    />
                    <Label htmlFor="adminNotifications">Admin Notifications</Label>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="digestFrequency">Digest Frequency</Label>
                  <Select value={settings.notifications.digestFrequency} onValueChange={(value) => updateSetting('notifications', 'digestFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real-time">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="twoFactorAuth"
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                    />
                    <Label htmlFor="twoFactorAuth">Require Two-Factor Authentication</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowSelfRegistration"
                      checked={settings.security.allowSelfRegistration}
                      onCheckedChange={(checked) => updateSetting('security', 'allowSelfRegistration', checked)}
                    />
                    <Label htmlFor="allowSelfRegistration">Allow Self Registration</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailVerificationRequired"
                      checked={settings.security.emailVerificationRequired}
                      onCheckedChange={(checked) => updateSetting('security', 'emailVerificationRequired', checked)}
                    />
                    <Label htmlFor="emailVerificationRequired">Require Email Verification</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requirePasswordChange"
                      checked={settings.security.requirePasswordChange}
                      onCheckedChange={(checked) => updateSetting('security', 'requirePasswordChange', checked)}
                    />
                    <Label htmlFor="requirePasswordChange">Require Periodic Password Change</Label>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Payment Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paymentGateway">Payment Gateway</Label>
                  <Select value={settings.payment.paymentGateway} onValueChange={(value) => updateSetting('payment', 'paymentGateway', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Stripe Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stripePublishableKey">Publishable Key</Label>
                      <Input
                        id="stripePublishableKey"
                        value={settings.payment.stripePublishableKey}
                        onChange={(e) => updateSetting('payment', 'stripePublishableKey', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stripeSecretKey">Secret Key</Label>
                      <Input
                        id="stripeSecretKey"
                        type="password"
                        value={settings.payment.stripeSecretKey}
                        onChange={(e) => updateSetting('payment', 'stripeSecretKey', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">PayPal Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paypalClientId">Client ID</Label>
                      <Input
                        id="paypalClientId"
                        value={settings.payment.paypalClientId}
                        onChange={(e) => updateSetting('payment', 'paypalClientId', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="paypalClientSecret">Client Secret</Label>
                      <Input
                        id="paypalClientSecret"
                        type="password"
                        value={settings.payment.paypalClientSecret}
                        onChange={(e) => updateSetting('payment', 'paypalClientSecret', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentCurrency">Currency</Label>
                    <Select value={settings.payment.currency} onValueChange={(value) => updateSetting('payment', 'currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={settings.payment.taxRate}
                      onChange={(e) => updateSetting('payment', 'taxRate', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Storage Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storageProvider">Storage Provider</Label>
                  <Select value={settings.storage.storageProvider} onValueChange={(value) => updateSetting('storage', 'storageProvider', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.storage.maxFileSize}
                    onChange={(e) => updateSetting('storage', 'maxFileSize', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {settings.storage.allowedFileTypes.map((type, index) => (
                      <Badge key={index} variant="outline">{type}</Badge>
                    ))}
                  </div>
                  <Input
                    className="mt-2"
                    placeholder="Add file types (comma-separated)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim();
                        if (value) {
                          const newTypes = value.split(',').map(t => t.trim()).filter(t => t);
                          updateSetting('storage', 'allowedFileTypes', [...settings.storage.allowedFileTypes, ...newTypes]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>

                {settings.storage.storageProvider === 's3' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-semibold">Amazon S3 Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="s3Bucket">S3 Bucket</Label>
                          <Input
                            id="s3Bucket"
                            value={settings.storage.s3Bucket}
                            onChange={(e) => updateSetting('storage', 's3Bucket', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="s3Region">S3 Region</Label>
                          <Input
                            id="s3Region"
                            value={settings.storage.s3Region}
                            onChange={(e) => updateSetting('storage', 's3Region', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="s3AccessKey">Access Key</Label>
                          <Input
                            id="s3AccessKey"
                            value={settings.storage.s3AccessKey}
                            onChange={(e) => updateSetting('storage', 's3AccessKey', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="s3SecretKey">Secret Key</Label>
                          <Input
                            id="s3SecretKey"
                            type="password"
                            value={settings.storage.s3SecretKey}
                            onChange={(e) => updateSetting('storage', 's3SecretKey', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>API Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rateLimit">Rate Limit (requests per minute)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={settings.api.rateLimit}
                    onChange={(e) => updateSetting('api', 'rateLimit', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableCors"
                    checked={settings.api.enableCors}
                    onCheckedChange={(checked) => updateSetting('api', 'enableCors', checked)}
                  />
                  <Label htmlFor="enableCors">Enable CORS</Label>
                </div>

                <div>
                  <Label htmlFor="corsOrigins">CORS Origins</Label>
                  <Input
                    id="corsOrigins"
                    value={settings.api.corsOrigins}
                    onChange={(e) => updateSetting('api', 'corsOrigins', e.target.value)}
                    placeholder="https://example.com, https://app.example.com"
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="apiKey"
                      value={settings.api.apiKey}
                      onChange={(e) => updateSetting('api', 'apiKey', e.target.value)}
                      readOnly
                    />
                    <Button variant="outline" size="sm">
                      Regenerate
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="webhookSecret"
                      value={settings.api.webhookSecret}
                      onChange={(e) => updateSetting('api', 'webhookSecret', e.target.value)}
                      readOnly
                    />
                    <Button variant="outline" size="sm">
                      Regenerate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
