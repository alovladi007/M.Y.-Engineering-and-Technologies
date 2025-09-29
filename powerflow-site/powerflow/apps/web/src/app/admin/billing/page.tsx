'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Calendar
} from 'lucide-react'

export default function AdminBilling() {
  const billingStats = {
    monthlyRevenue: 42850,
    revenueGrowth: 23.4,
    totalSubscriptions: 156,
    churnRate: 2.1,
    avgRevenuePerUser: 274.68
  }

  const revenueByPlan = [
    { plan: 'Enterprise', count: 12, revenue: 59880, percentage: 78.3 },
    { plan: 'Pro', count: 89, revenue: 15741, percentage: 20.6 },
    { plan: 'Free', count: 55, revenue: 0, percentage: 0 }
  ]

  const recentPayments = [
    {
      id: 'pay-1',
      organization: 'Tesla Motors',
      amount: 4990,
      status: 'succeeded',
      date: '2025-09-08',
      plan: 'Enterprise'
    },
    {
      id: 'pay-2',
      organization: 'BYD Auto',
      amount: 4990,
      status: 'succeeded',
      date: '2025-09-08',
      plan: 'Enterprise'
    },
    {
      id: 'pay-3',
      organization: 'Volkswagen Group',
      amount: 2970,
      status: 'failed',
      date: '2025-09-07',
      plan: 'Pro'
    },
    {
      id: 'pay-4',
      organization: 'General Motors',
      amount: 2376,
      status: 'pending',
      date: '2025-09-07',
      plan: 'Pro'
    },
    {
      id: 'pay-5',
      organization: 'Ford Motor Company',
      amount: 1881,
      status: 'succeeded',
      date: '2025-09-06',
      plan: 'Pro'
    }
  ]

  const failedPayments = [
    {
      id: 'fail-1',
      organization: 'Volkswagen Group',
      amount: 2970,
      reason: 'Insufficient funds',
      retryDate: '2025-09-10',
      attempts: 2
    },
    {
      id: 'fail-2',
      organization: 'Nissan Motor Co',
      amount: 1584,
      reason: 'Card expired',
      retryDate: '2025-09-09',
      attempts: 1
    }
  ]

  const getPaymentStatusBadge = (status: string) => {
    const config = {
      'succeeded': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'failed': { variant: 'destructive', icon: AlertCircle, color: 'text-red-600' },
      'pending': { variant: 'outline', icon: Clock, color: 'text-yellow-600' }
    }
    
    const { variant, icon: Icon, color } = config[status] || config['pending']
    
    return (
      <Badge variant={variant} className="capitalize">
        <Icon className={`h-3 w-3 mr-1 ${color}`} />
        {status}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing Administration</h1>
        <p className="text-muted-foreground">Monitor revenue, subscriptions, and payment processing</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">${billingStats.monthlyRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{billingStats.revenueGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{billingStats.totalSubscriptions}</div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">${billingStats.avgRevenuePerUser.toFixed(0)}</div>
                <p className="text-sm text-muted-foreground">ARPU</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{billingStats.churnRate}%</div>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{failedPayments.length}</div>
                <p className="text-sm text-muted-foreground">Failed Payments</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>Revenue breakdown by subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByPlan.map((item) => (
                <div key={item.plan} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{item.plan}</div>
                    <Badge variant="outline">{item.count} orgs</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${item.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Failed Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              Failed Payments
            </CardTitle>
            <CardDescription>Payments requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {failedPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <div className="font-medium">{payment.organization}</div>
                    <div className="text-sm text-muted-foreground">{payment.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${payment.amount}</div>
                    <div className="text-xs text-muted-foreground">
                      Retry: {new Date(payment.retryDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                Retry All Failed Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Recent Payments
          </CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{payment.organization}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{payment.plan}</Badge>
                  
                  <div className="text-right">
                    <div className="font-medium">${payment.amount.toLocaleString()}</div>
                  </div>

                  {getPaymentStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {recentPayments.length} recent payments
            </p>
            <Button variant="outline">View All Transactions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}