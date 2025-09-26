'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Activity
} from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activePatents: 247,
    pendingApplications: 18,
    upcomingDeadlines: 5,
    aiDrafts: 1042,
    portfolioValue: 24500000,
    grantRate: 87
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'Office Action Response', patent: 'US10,123,456', date: '2 hours ago', status: 'Submitted' },
    { id: 2, action: 'Claims Amended', patent: 'EP3,234,567', date: '5 hours ago', status: 'In Review' },
    { id: 3, action: 'Prior Art Search', patent: 'New Filing #42', date: '1 day ago', status: 'Completed' },
    { id: 4, action: 'IDS Filed', patent: 'US11,234,567', date: '2 days ago', status: 'Accepted' }
  ])

  const [filingTrends, setFilingTrends] = useState([
    { month: 'Jan', filings: 12 },
    { month: 'Feb', filings: 19 },
    { month: 'Mar', filings: 15 },
    { month: 'Apr', filings: 25 },
    { month: 'May', filings: 22 },
    { month: 'Jun', filings: 30 }
  ])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to LUMA IP - Your AI-Powered Patent Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePatents}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              5 require action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">
              Next: March 15, 2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.portfolioValue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              +18% valuation increase
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Filing Trends Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Filing Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Chart would go here - using placeholder */}
              <div className="flex items-end justify-between h-full">
                {filingTrends.map((trend, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div 
                      className="w-12 bg-purple-600 rounded-t"
                      style={{ height: `${trend.filings * 8}px` }}
                    />
                    <span className="text-xs mt-2">{trend.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.patent} • {activity.date}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    activity.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    activity.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                    activity.status === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              New Patent Filing
            </Button>
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Generate Claims
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View Docket
            </Button>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Team Management
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Card */}
      <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardHeader>
          <CardTitle className="text-white">AI Patent Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Generate complete patent applications in minutes with our advanced LLM technology
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>AI Processing Capacity</span>
              <span>85%</span>
            </div>
            <Progress value={85} className="bg-purple-800" />
          </div>
          <Button className="mt-4 bg-white text-purple-700 hover:bg-gray-100">
            Start AI Drafting
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}