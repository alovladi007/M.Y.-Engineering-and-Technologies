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
  UserCheck, 
  UserX, 
  Shield,
  Building2,
  Calendar,
  Mail
} from 'lucide-react'

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const users = [
    {
      id: 'user-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@tesla.com',
      organization: 'Tesla Motors',
      role: 'Engineer',
      status: 'active',
      lastLogin: '2 minutes ago',
      plan: 'Enterprise',
      joinDate: '2024-01-15'
    },
    {
      id: 'user-2',
      name: 'Michael Rodriguez',
      email: 'mrodriguez@byd.com',
      organization: 'BYD Auto',
      role: 'Senior Engineer',
      status: 'active',
      lastLogin: '1 hour ago',
      plan: 'Enterprise',
      joinDate: '2024-02-03'
    },
    {
      id: 'user-3',
      name: 'Lisa Wagner',
      email: 'lisa.wagner@vw.de',
      organization: 'Volkswagen Group',
      role: 'Team Lead',
      status: 'active',
      lastLogin: '3 hours ago',
      plan: 'Pro',
      joinDate: '2024-01-28'
    },
    {
      id: 'user-4',
      name: 'James Thompson',
      email: 'jthompson@gm.com',
      organization: 'General Motors',
      role: 'Engineer',
      status: 'inactive',
      lastLogin: '2 days ago',
      plan: 'Pro',
      joinDate: '2023-11-12'
    },
    {
      id: 'user-5',
      name: 'Anna Kowalski',
      email: 'anna.k@ford.com',
      organization: 'Ford Motor Company',
      role: 'Manager',
      status: 'active',
      lastLogin: '30 minutes ago',
      plan: 'Pro',
      joinDate: '2024-03-05'
    }
  ]

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status === 'active' ? (
          <UserCheck className="h-3 w-3 mr-1" />
        ) : (
          <UserX className="h-3 w-3 mr-1" />
        )}
        {status}
      </Badge>
    )
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
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage platform users and permissions</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">892</div>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">355</div>
            <p className="text-sm text-muted-foreground">Inactive Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">127</div>
            <p className="text-sm text-muted-foreground">New This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Search and manage platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          {/* Users Table */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-blue-600">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center text-sm">
                      <Building2 className="h-3 w-3 mr-1" />
                      {user.organization}
                    </div>
                    <div className="text-xs text-muted-foreground">{user.role}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm">Last login</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {user.lastLogin}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {getStatusBadge(user.status)}
                    {getPlanBadge(user.plan)}
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
              Showing {filteredUsers.length} of {users.length} users
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