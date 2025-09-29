'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Check, CreditCard, Download, AlertCircle, Zap } from 'lucide-react'

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState('pro')

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: [
        'Basic simulation kernels',
        'Limited HIL access',
        'Community support'
      ],
      limits: {
        simMinutes: 200,
        devices: 1,
        projects: 1,
        telemetryGB: 5,
        sstDesigns: 2
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Advanced simulation kernels',
        'SST design tools',
        'ML optimization',
        'Priority support',
        'Data export'
      ],
      limits: {
        simMinutes: 5000,
        devices: 5,
        projects: 20,
        telemetryGB: 200,
        sstDesigns: 50
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 499,
      currency: 'USD',
      interval: 'month',
      features: [
        'Unlimited simulations',
        'SST design & optimization',
        'CCS/OCPP conformance',
        'Data-center energy OS',
        'SAML/SCIM',
        'VPC peering',
        'Dedicated support'
      ],
      limits: {
        simMinutes: -1,
        devices: -1,
        projects: -1,
        telemetryGB: -1,
        sstDesigns: -1
      }
    }
  ]

  const currentUsage = {
    simMinutes: 127,
    devices: 1,
    projects: 3,
    telemetryGB: 2.4,
    sstDesigns: 1
  }

  const invoices = [
    {
      id: 'inv-1',
      amount: 99.00,
      currency: 'USD',
      status: 'paid',
      date: '2025-09-01',
      description: 'Pro Plan - September 2025'
    },
    {
      id: 'inv-2',
      amount: 99.00,
      currency: 'USD',
      status: 'paid',
      date: '2025-08-01',
      description: 'Pro Plan - August 2025'
    }
  ]

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((current / limit) * 100, 100);
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toLocaleString();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground">Manage your subscription and monitor usage</p>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Current Usage</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your active subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold">Pro Plan</div>
                    <div className="text-muted-foreground">$99/month</div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Invoice</CardTitle>
                <CardDescription>Upcoming billing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span className="font-medium">$99.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span className="font-medium">Oct 1, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="outline">Scheduled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
              <CardDescription>September 2025 usage breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Simulation Minutes</span>
                    <span className="text-sm text-muted-foreground">
                      {currentUsage.simMinutes} / {formatLimit(plans.find(p => p.id === 'pro')?.limits.simMinutes || 0)}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(currentUsage.simMinutes, plans.find(p => p.id === 'pro')?.limits.simMinutes || 0)} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Connected Devices</span>
                    <span className="text-sm text-muted-foreground">
                      {currentUsage.devices} / {formatLimit(plans.find(p => p.id === 'pro')?.limits.devices || 0)}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(currentUsage.devices, plans.find(p => p.id === 'pro')?.limits.devices || 0)} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Projects</span>
                    <span className="text-sm text-muted-foreground">
                      {currentUsage.projects} / {formatLimit(plans.find(p => p.id === 'pro')?.limits.projects || 0)}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(currentUsage.projects, plans.find(p => p.id === 'pro')?.limits.projects || 0)} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Telemetry Storage (GB)</span>
                    <span className="text-sm text-muted-foreground">
                      {currentUsage.telemetryGB} / {formatLimit(plans.find(p => p.id === 'pro')?.limits.telemetryGB || 0)}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(currentUsage.telemetryGB, plans.find(p => p.id === 'pro')?.limits.telemetryGB || 0)} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">SST Designs</span>
                    <span className="text-sm text-muted-foreground">
                      {currentUsage.sstDesigns} / {formatLimit(plans.find(p => p.id === 'pro')?.limits.sstDesigns || 0)}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(currentUsage.sstDesigns, plans.find(p => p.id === 'pro')?.limits.sstDesigns || 0)} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.id === 'pro' ? 'border-blue-500 border-2' : ''}`}>
                {plan.id === 'pro' && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold">
                    ${plan.price}
                    <span className="text-lg font-normal text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <div className="text-sm font-medium">Usage Limits:</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>• Sim Minutes: {formatLimit(plan.limits.simMinutes)}</div>
                      <div>• Devices: {formatLimit(plan.limits.devices)}</div>
                      <div>• Projects: {formatLimit(plan.limits.projects)}</div>
                      <div>• Storage: {formatLimit(plan.limits.telemetryGB)} GB</div>
                      <div>• SST Designs: {formatLimit(plan.limits.sstDesigns)}</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={plan.id === 'pro' ? 'default' : 'outline'}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.id === 'pro' ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Enterprise Features
              </CardTitle>
              <CardDescription>Additional capabilities for large teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-medium">Authentication & Access</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SAML/SCIM integration</li>
                    <li>• Advanced role-based access</li>
                    <li>• Audit logging</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Infrastructure</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• VPC peering</li>
                    <li>• Dedicated instances</li>
                    <li>• Custom data retention</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Support</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 24/7 dedicated support</li>
                    <li>• Custom training</li>
                    <li>• Implementation assistance</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Compliance</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SOC 2 Type II</li>
                    <li>• Data residency options</li>
                    <li>• Custom agreements</li>
                  </ul>
                </div>
              </div>
              <Button className="mt-4">Contact Sales</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Your billing history and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{invoice.description}</div>
                        <div className="text-sm text-muted-foreground">{invoice.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">${invoice.amount.toFixed(2)} {invoice.currency}</div>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Manage your payment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center text-sm font-bold">
                      ••••
                    </div>
                    <div>
                      <div className="font-medium">•••• •••• •••• 4242</div>
                      <div className="text-sm text-muted-foreground">Expires 12/26</div>
                    </div>
                  </div>
                  <Badge variant="default">Primary</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Update Payment Method
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Alerts</CardTitle>
                <CardDescription>Configure usage notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Usage Warnings</div>
                    <div className="text-xs text-muted-foreground">Alert at 80% of quota</div>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Limit Reached</div>
                    <div className="text-xs text-muted-foreground">Alert when quota exceeded</div>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <Button variant="outline" className="w-full">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Company and contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    defaultValue="PowerFlow Technologies"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tax ID</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Enter tax identification number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Billing Address</label>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    rows={3}
                    defaultValue="123 Innovation Drive&#10;Tech City, TC 12345&#10;United States"
                  />
                </div>
              </div>
              <Button className="mt-4">Update Information</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}