'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Settings, User, Shield, Bell, Monitor, Database, LogOut, Mail, Building2 } from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  organization?: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    system: true,
    maintenance: true
  })
  const [theme, setTheme] = useState('light')
  const router = useRouter()

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your PowerFlow platform preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>Your current account details and session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user ? (
                <>
                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-lg">{user.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                      {user.organization && (
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Building2 className="h-3 w-3 mr-1" />
                          {user.organization}
                        </div>
                      )}
                    </div>
                    <div>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        type="text"
                        className="mt-1"
                        defaultValue={user.name}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email Address</label>
                      <Input
                        type="email"
                        className="mt-1"
                        defaultValue={user.email}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  {user.organization && (
                    <div>
                      <label className="text-sm font-medium">Organization</label>
                      <Input
                        type="text"
                        className="mt-1"
                        defaultValue={user.organization}
                        readOnly
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <Button>Update Profile</Button>
                      <Button variant="outline" className="ml-2">Change Password</Button>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={handleLogout}
                      className="flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Please log in to view account information</p>
                  <Button onClick={() => router.push('/login')}>
                    Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </CardTitle>
              <CardDescription>Manage your profile and personal preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">User profile settings are now in the Account tab</div>
                <Button variant="outline" onClick={() => document.querySelector('[value="account"]')?.click()}>
                  Go to Account Settings
                </Button>
              </div>
              <Button>Update Profile</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Display Preferences</span>
              </CardTitle>
              <CardDescription>Customize the appearance of your interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">Theme</label>
                <div className="flex space-x-4">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'auto' ? 'default' : 'outline'}
                    onClick={() => setTheme('auto')}
                  >
                    Auto
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Dense Layout</div>
                  <div className="text-sm text-muted-foreground">Show more information in less space</div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Show Advanced Controls</div>
                  <div className="text-sm text-muted-foreground">Display advanced system controls by default</div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive updates via email</div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked: boolean) => setNotifications({...notifications, email: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">Browser push notifications</div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked: boolean) => setNotifications({...notifications, push: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">System Alerts</div>
                  <div className="text-sm text-muted-foreground">Critical system notifications</div>
                </div>
                <Switch
                  checked={notifications.system}
                  onCheckedChange={(checked: boolean) => setNotifications({...notifications, system: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Maintenance Reminders</div>
                  <div className="text-sm text-muted-foreground">Scheduled maintenance notifications</div>
                </div>
                <Switch
                  checked={notifications.maintenance}
                  onCheckedChange={(checked: boolean) => setNotifications({...notifications, maintenance: checked})}
                />
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
              <CardDescription>Manage your account security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Password Security</h3>
                <div className="space-y-4">
                  <Button variant="outline">Change Password</Button>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                    </div>
                    <Badge variant="secondary">Not Enabled</Badge>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">API Access</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">API Key</div>
                      <div className="text-sm text-muted-foreground">pk_••••••••••••••••••••••••••••••••</div>
                    </div>
                    <Button variant="outline" size="sm">Regenerate</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">API Rate Limiting</div>
                      <div className="text-sm text-muted-foreground">1000 requests per hour</div>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System Configuration</span>
              </CardTitle>
              <CardDescription>Advanced system settings and configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Simulation Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Default Simulation Time (ms)</label>
                    <input
                      type="number"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      defaultValue="1000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Maximum Concurrent Simulations</label>
                    <input
                      type="number"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      defaultValue="5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Hardware Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-Connect Devices</div>
                      <div className="text-sm text-muted-foreground">Automatically connect detected hardware</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Hardware Monitoring</div>
                      <div className="text-sm text-muted-foreground">Monitor device health and status</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Data & Storage</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Size</span>
                    <span className="text-sm font-medium">247 MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Backup Frequency</span>
                    <span className="text-sm font-medium">Daily</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">Export Data</Button>
                    <Button variant="outline">Create Backup</Button>
                  </div>
                </div>
              </div>

              <Button>Save System Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}