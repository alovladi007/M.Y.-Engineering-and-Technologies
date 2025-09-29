'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Mail,
  Shield,
  Database,
  Bell,
  Key,
  Globe,
  Palette,
  Download,
  Upload
} from 'lucide-react'

export default function AdminSettings() {
  const platformSettings = {
    general: {
      platformName: 'PowerFlow',
      domain: 'powerflow.dev',
      supportEmail: 'support@powerflow.dev',
      maxOrgUsers: 100,
      trialPeriod: 14
    },
    security: {
      requireMfa: false,
      passwordMinLength: 8,
      sessionTimeout: 24,
      ipWhitelisting: false,
      apiRateLimit: 1000
    },
    billing: {
      currency: 'USD',
      taxRate: 8.25,
      gracePeriod: 7,
      invoicePrefix: 'PF-',
      autoSuspend: true
    },
    notifications: {
      emailNotifications: true,
      slackWebhook: '',
      alertThresholds: {
        cpuUsage: 80,
        memoryUsage: 85,
        errorRate: 1.0
      }
    }
  }

  const integrations = [
    {
      name: 'Stripe',
      description: 'Payment processing and billing',
      status: 'connected',
      lastSync: '2 minutes ago'
    },
    {
      name: 'SendGrid',
      description: 'Email delivery service',
      status: 'connected',
      lastSync: '1 hour ago'
    },
    {
      name: 'Slack',
      description: 'Team notifications',
      status: 'disconnected',
      lastSync: 'Never'
    },
    {
      name: 'Datadog',
      description: 'System monitoring',
      status: 'connected',
      lastSync: '5 minutes ago'
    }
  ]

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'connected' ? 'default' : 'secondary'}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform settings and integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Platform Name</label>
              <Input defaultValue={platformSettings.general.platformName} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Domain</label>
              <Input defaultValue={platformSettings.general.domain} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Support Email</label>
              <Input defaultValue={platformSettings.general.supportEmail} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Max Users per Org</label>
                <Input 
                  type="number" 
                  defaultValue={platformSettings.general.maxOrgUsers} 
                  className="mt-1" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Trial Period (days)</label>
                <Input 
                  type="number" 
                  defaultValue={platformSettings.general.trialPeriod} 
                  className="mt-1" 
                />
              </div>
            </div>
            <Button className="w-full">Save General Settings</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>Authentication and security configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Require MFA</div>
                <div className="text-xs text-muted-foreground">Force multi-factor authentication</div>
              </div>
              <input 
                type="checkbox" 
                defaultChecked={platformSettings.security.requireMfa}
                className="rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password Min Length</label>
              <Input 
                type="number" 
                defaultValue={platformSettings.security.passwordMinLength} 
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Session Timeout (hours)</label>
              <Input 
                type="number" 
                defaultValue={platformSettings.security.sessionTimeout} 
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium">API Rate Limit (req/hour)</label>
              <Input 
                type="number" 
                defaultValue={platformSettings.security.apiRateLimit} 
                className="mt-1" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">IP Whitelisting</div>
                <div className="text-xs text-muted-foreground">Restrict access by IP</div>
              </div>
              <input 
                type="checkbox" 
                defaultChecked={platformSettings.security.ipWhitelisting}
                className="rounded"
              />
            </div>
            <Button className="w-full">Save Security Settings</Button>
          </CardContent>
        </Card>

        {/* Billing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Billing Settings
            </CardTitle>
            <CardDescription>Payment and billing configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md" defaultValue={platformSettings.billing.currency}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Tax Rate (%)</label>
                <Input 
                  type="number" 
                  step="0.01"
                  defaultValue={platformSettings.billing.taxRate} 
                  className="mt-1" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Grace Period (days)</label>
                <Input 
                  type="number" 
                  defaultValue={platformSettings.billing.gracePeriod} 
                  className="mt-1" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Invoice Prefix</label>
                <Input defaultValue={platformSettings.billing.invoicePrefix} className="mt-1" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Auto-suspend on Non-payment</div>
                <div className="text-xs text-muted-foreground">Suspend accounts with failed payments</div>
              </div>
              <input 
                type="checkbox" 
                defaultChecked={platformSettings.billing.autoSuspend}
                className="rounded"
              />
            </div>
            <Button className="w-full">Save Billing Settings</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>Alert thresholds and notification channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Email Notifications</div>
                <div className="text-xs text-muted-foreground">Send alerts via email</div>
              </div>
              <input 
                type="checkbox" 
                defaultChecked={platformSettings.notifications.emailNotifications}
                className="rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slack Webhook URL</label>
              <Input 
                placeholder="https://hooks.slack.com/services/..." 
                defaultValue={platformSettings.notifications.slackWebhook}
                className="mt-1" 
              />
            </div>
            <div className="space-y-3">
              <div className="text-sm font-medium">Alert Thresholds</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">CPU Usage (%)</label>
                  <Input 
                    type="number" 
                    defaultValue={platformSettings.notifications.alertThresholds.cpuUsage} 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Memory Usage (%)</label>
                  <Input 
                    type="number" 
                    defaultValue={platformSettings.notifications.alertThresholds.memoryUsage} 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Error Rate (%)</label>
                  <Input 
                    type="number" 
                    step="0.1"
                    defaultValue={platformSettings.notifications.alertThresholds.errorRate} 
                    className="mt-1" 
                  />
                </div>
              </div>
            </div>
            <Button className="w-full">Save Notification Settings</Button>
          </CardContent>
        </Card>
      </div>

      {/* Integrations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            External Integrations
          </CardTitle>
          <CardDescription>Connected services and APIs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{integration.name}</div>
                    <div className="text-sm text-muted-foreground">{integration.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm">Last sync: {integration.lastSync}</div>
                    {getStatusBadge(integration.status)}
                  </div>
                  <Button variant="outline" size="sm">
                    {integration.status === 'connected' ? 'Configure' : 'Connect'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Data Management
          </CardTitle>
          <CardDescription>Backup, export, and maintenance operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              Export Data
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Upload className="h-6 w-6 mb-2" />
              Import Data
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Database className="h-6 w-6 mb-2" />
              Database Backup
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              System Maintenance
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-yellow-800">System Maintenance Scheduled</div>
                <div className="text-sm text-yellow-700">
                  Next maintenance window: Sunday, Sept 10, 2025 at 2:00 AM UTC (estimated 30 minutes)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}