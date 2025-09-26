'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building2, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Server,
  Zap,
  DollarSign,
  Clock
} from 'lucide-react'

export default function AdminDashboard() {
  const systemStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalOrgs: 156,
    activeOrgs: 128,
    monthlyRevenue: 42850,
    systemUptime: 99.97,
    activeSimulations: 23,
    cpuUsage: 67,
    memoryUsage: 72,
    storageUsage: 45
  }

  const recentAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'High CPU usage on simulation cluster',
      timestamp: '2 minutes ago',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      message: 'New organization registered: Tesla Motors',
      timestamp: '15 minutes ago',
      severity: 'low'
    },
    {
      id: 3,
      type: 'error',
      message: 'Payment failed for org-id: acme-corp',
      timestamp: '1 hour ago',
      severity: 'high'
    }
  ]

  const topOrganizations = [
    { name: 'Tesla Motors', users: 45, plan: 'Enterprise', mrr: 4990 },
    { name: 'BYD Auto', users: 32, plan: 'Enterprise', mrr: 4990 },
    { name: 'Volkswagen Group', users: 28, plan: 'Pro', mrr: 2970 },
    { name: 'General Motors', users: 24, plan: 'Pro', mrr: 2376 },
    { name: 'Ford Motor Company', users: 19, plan: 'Pro', mrr: 1881 }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and system monitoring</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeOrgs}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${systemStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Above target</span> (99.9%)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
            <CardDescription>Real-time system resource monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">{systemStats.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    systemStats.cpuUsage > 80 ? 'bg-red-600' : systemStats.cpuUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${systemStats.cpuUsage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{systemStats.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    systemStats.memoryUsage > 80 ? 'bg-red-600' : systemStats.memoryUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${systemStats.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-muted-foreground">{systemStats.storageUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    systemStats.storageUsage > 80 ? 'bg-red-600' : systemStats.storageUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${systemStats.storageUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Simulations</span>
                <Badge variant="outline" className="text-blue-600">
                  <Zap className="h-3 w-3 mr-1" />
                  {systemStats.activeSimulations} running
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Recent Alerts
            </CardTitle>
            <CardDescription>System alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-600' :
                      alert.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    alert.severity === 'high' ? 'destructive' :
                    alert.severity === 'medium' ? 'default' : 'secondary'
                  }>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Organizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Top Organizations
          </CardTitle>
          <CardDescription>Organizations by revenue and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topOrganizations.map((org, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-muted-foreground">{org.users} users</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${org.mrr.toLocaleString()}/mo</div>
                  <Badge variant="outline">{org.plan}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}