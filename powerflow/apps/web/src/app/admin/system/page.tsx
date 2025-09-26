'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Server, 
  Database, 
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Users
} from 'lucide-react'

export default function AdminSystem() {
  const systemHealth = {
    api: { status: 'healthy', uptime: '99.97%', responseTime: '45ms' },
    database: { status: 'healthy', uptime: '99.99%', connections: 23 },
    redis: { status: 'healthy', uptime: '99.95%', memory: '67%' },
    storage: { status: 'warning', uptime: '99.89%', usage: '78%' },
    websocket: { status: 'healthy', uptime: '99.96%', connections: 142 }
  }

  const resourceUsage = {
    cpu: { usage: 67, cores: 16, frequency: '3.2 GHz' },
    memory: { usage: 72, total: '64 GB', available: '18 GB' },
    storage: { usage: 45, total: '2 TB', available: '1.1 TB' },
    network: { ingress: '125 MB/s', egress: '89 MB/s' }
  }

  const activeServices = [
    { name: 'API Gateway', status: 'running', instances: 3, cpu: '23%', memory: '1.2GB' },
    { name: 'Simulation Engine', status: 'running', instances: 5, cpu: '78%', memory: '4.8GB' },
    { name: 'WebSocket Server', status: 'running', instances: 2, cpu: '12%', memory: '512MB' },
    { name: 'Background Jobs', status: 'running', instances: 4, cpu: '34%', memory: '2.1GB' },
    { name: 'File Storage', status: 'warning', instances: 1, cpu: '89%', memory: '3.2GB' },
    { name: 'Analytics Engine', status: 'stopped', instances: 0, cpu: '0%', memory: '0GB' }
  ]

  const systemMetrics = {
    totalUsers: 1247,
    activeUsers: 892,
    activeSimulations: 23,
    dataProcessed: '1.2TB',
    requestsPerMinute: 1450,
    errorRate: '0.03%'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
      case 'stopped':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'healthy': 'default',
      'running': 'default',
      'warning': 'outline',
      'error': 'destructive',
      'stopped': 'secondary'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <p className="text-muted-foreground">Monitor platform health, performance, and resources</p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-blue-600" />
              <Badge variant="outline">{systemMetrics.activeUsers}</Badge>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold">{systemMetrics.totalUsers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Zap className="h-5 w-5 text-yellow-600" />
              <Badge variant="default">{systemMetrics.activeSimulations}</Badge>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold">{systemMetrics.requestsPerMinute}</div>
              <div className="text-xs text-muted-foreground">Requests/min</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Database className="h-5 w-5 text-green-600" />
              <Badge variant="outline">{systemMetrics.dataProcessed}</Badge>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold">{systemMetrics.errorRate}</div>
              <div className="text-xs text-muted-foreground">Error Rate</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Cpu className="h-5 w-5 text-purple-600" />
              <Badge variant={resourceUsage.cpu.usage > 80 ? 'destructive' : 'default'}>
                {resourceUsage.cpu.usage}%
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold">{resourceUsage.cpu.cores} Cores</div>
              <div className="text-xs text-muted-foreground">CPU Usage</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <MemoryStick className="h-5 w-5 text-orange-600" />
              <Badge variant={resourceUsage.memory.usage > 80 ? 'destructive' : 'default'}>
                {resourceUsage.memory.usage}%
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold">{resourceUsage.memory.total}</div>
              <div className="text-xs text-muted-foreground">Memory</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <HardDrive className="h-5 w-5 text-indigo-600" />
              <Badge variant={resourceUsage.storage.usage > 80 ? 'destructive' : 'default'}>
                {resourceUsage.storage.usage}%
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold">{resourceUsage.storage.total}</div>
              <div className="text-xs text-muted-foreground">Storage</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
            <CardDescription>Core service status and uptime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(systemHealth.api.status)}
                  <div>
                    <div className="font-medium">API Gateway</div>
                    <div className="text-sm text-muted-foreground">Response time: {systemHealth.api.responseTime}</div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(systemHealth.api.status)}
                  <div className="text-xs text-muted-foreground mt-1">
                    Uptime: {systemHealth.api.uptime}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(systemHealth.database.status)}
                  <div>
                    <div className="font-medium">Database</div>
                    <div className="text-sm text-muted-foreground">{systemHealth.database.connections} connections</div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(systemHealth.database.status)}
                  <div className="text-xs text-muted-foreground mt-1">
                    Uptime: {systemHealth.database.uptime}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(systemHealth.websocket.status)}
                  <div>
                    <div className="font-medium">WebSocket</div>
                    <div className="text-sm text-muted-foreground">{systemHealth.websocket.connections} connections</div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(systemHealth.websocket.status)}
                  <div className="text-xs text-muted-foreground mt-1">
                    Uptime: {systemHealth.websocket.uptime}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(systemHealth.storage.status)}
                  <div>
                    <div className="font-medium">File Storage</div>
                    <div className="text-sm text-muted-foreground">Usage: {systemHealth.storage.usage}</div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(systemHealth.storage.status)}
                  <div className="text-xs text-muted-foreground mt-1">
                    Uptime: {systemHealth.storage.uptime}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Active Services
            </CardTitle>
            <CardDescription>Running services and resource usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.instances} {service.instances === 1 ? 'instance' : 'instances'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(service.status)}
                    <div className="text-xs text-muted-foreground mt-1">
                      CPU: {service.cpu} | RAM: {service.memory}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 mt-4">
              <Button size="sm">Restart All</Button>
              <Button size="sm" variant="outline">Scale Services</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Usage</CardTitle>
          <CardDescription>Detailed system resource monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">{resourceUsage.cpu.usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    resourceUsage.cpu.usage > 80 ? 'bg-red-600' : resourceUsage.cpu.usage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${resourceUsage.cpu.usage}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {resourceUsage.cpu.cores} cores @ {resourceUsage.cpu.frequency}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{resourceUsage.memory.usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    resourceUsage.memory.usage > 80 ? 'bg-red-600' : resourceUsage.memory.usage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${resourceUsage.memory.usage}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {resourceUsage.memory.available} available of {resourceUsage.memory.total}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-muted-foreground">{resourceUsage.storage.usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    resourceUsage.storage.usage > 80 ? 'bg-red-600' : resourceUsage.storage.usage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${resourceUsage.storage.usage}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {resourceUsage.storage.available} available of {resourceUsage.storage.total}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Network Traffic</span>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">In:</span> {resourceUsage.network.ingress}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Out:</span> {resourceUsage.network.egress}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}