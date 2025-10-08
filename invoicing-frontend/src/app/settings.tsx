import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Building2, Bell, Shield } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await apiClient.get('/api/auth/me');
      return response.data?.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building2 className="mr-2 h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information and email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    defaultValue={user?.name || ''}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    defaultValue={user?.email || ''}
                    disabled
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button disabled>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  placeholder="Acme Inc."
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-address">Business Address</Label>
                <Input
                  id="org-address"
                  placeholder="123 Business St, City, Country"
                  disabled
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID</Label>
                  <Input
                    id="tax-id"
                    placeholder="XX-XXXXXXX"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Input
                    id="currency"
                    placeholder="USD"
                    defaultValue="USD"
                    disabled
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button disabled>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Invoice Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders for upcoming invoice due dates
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when payments are received
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  disabled
                />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button disabled>Update Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Not enabled
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Coming Soon</CardTitle>
          <CardDescription className="text-yellow-700">
            Settings functionality is currently under development. All fields are disabled and will be enabled in a future update.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SettingsPage;