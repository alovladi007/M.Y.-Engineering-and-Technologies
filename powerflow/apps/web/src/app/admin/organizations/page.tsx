'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Building2, 
  Users, 
  Calendar,
  TrendingUp,
  DollarSign,
  Zap
} from 'lucide-react'

export default function AdminOrganizations() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const organizations = [
    {
      id: 'org-1',
      name: 'Tesla Motors',
      domain: 'tesla.com',
      users: 45,
      plan: 'Enterprise',
      mrr: 4990,
      status: 'active',
      joinDate: '2023-08-15',
      lastActivity: '5 minutes ago',
      usage: {
        simMinutes: 12450,
        projects: 127,
        storage: 890
      }
    },
    {
      id: 'org-2',
      name: 'BYD Auto',
      domain: 'byd.com',
      users: 32,
      plan: 'Enterprise',
      mrr: 4990,
      status: 'active',
      joinDate: '2023-09-03',
      lastActivity: '1 hour ago',
      usage: {
        simMinutes: 8920,
        projects: 89,
        storage: 654
      }
    },
    {
      id: 'org-3',
      name: 'Volkswagen Group',
      domain: 'vw.de',
      users: 28,
      plan: 'Pro',
      mrr: 2970,
      status: 'active',
      joinDate: '2023-10-12',
      lastActivity: '2 hours ago',
      usage: {
        simMinutes: 6780,
        projects: 56,
        storage: 432
      }
    },
    {
      id: 'org-4',
      name: 'General Motors',
      domain: 'gm.com',
      users: 24,
      plan: 'Pro',
      mrr: 2376,
      status: 'active',
      joinDate: '2023-11-28',
      lastActivity: '4 hours ago',
      usage: {
        simMinutes: 5430,
        projects: 43,
        storage: 321
      }
    },
    {
      id: 'org-5',
      name: 'Rivian Automotive',
      domain: 'rivian.com',
      users: 16,
      plan: 'Pro',
      mrr: 1584,
      status: 'trial',
      joinDate: '2025-08-15',
      lastActivity: '1 day ago',
      usage: {
        simMinutes: 1200,
        projects: 12,
        storage: 89
      }
    }
  ]

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.domain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'trial': 'outline',
      'suspended': 'destructive',
      'inactive': 'secondary'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  const getPlanBadge = (plan: string) => {
    const variant = plan === 'Enterprise' ? 'default' : plan === 'Pro' ? 'outline' : 'secondary'
    return <Badge variant={variant}>{plan}</Badge>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Organization Management</h1>
            <p className="text-muted-foreground">Manage customer organizations and accounts</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">Total Organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">128</div>
            <p className="text-sm text-muted-foreground">Active Orgs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">23</div>
            <p className="text-sm text-muted-foreground">Trial Orgs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">$42.8K</div>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>Manage customer organizations and subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations by name or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>

          <div className="space-y-4">
            {filteredOrgs.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-muted-foreground">@{org.domain}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="flex items-center text-sm font-medium">
                      <Users className="h-3 w-3 mr-1" />
                      {org.users}
                    </div>
                    <div className="text-xs text-muted-foreground">Users</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center text-sm font-medium">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ${org.mrr.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">MRR</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center text-sm font-medium">
                      <Zap className="h-3 w-3 mr-1" />
                      {org.usage.simMinutes.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Sim Minutes</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm">Joined</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(org.joinDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {getStatusBadge(org.status)}
                    {getPlanBadge(org.plan)}
                  </div>

                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredOrgs.length} of {organizations.length} organizations
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}