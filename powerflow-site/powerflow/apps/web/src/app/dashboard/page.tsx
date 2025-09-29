'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Cpu, Database, Zap, PlayCircle, StopCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

const SimulationChart = dynamic(() => import('@/components/simulation-chart'), { ssr: false })

export default function Dashboard() {
  const [isSimulating, setIsSimulating] = useState(false)

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulation Status</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isSimulating ? 'Running' : 'Idle'}</div>
            <p className="text-xs text-muted-foreground">
              {isSimulating ? 'Processing simulation...' : 'Ready to simulate'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hardware Devices</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Connected</div>
            <p className="text-xs text-muted-foreground">2 STM32, 1 Raspberry Pi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Power Output</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2 kW</div>
            <p className="text-xs text-muted-foreground">+12% from baseline</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Simulation</CardTitle>
            <CardDescription>Start a quick power electronics simulation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={toggleSimulation}
              variant={isSimulating ? 'destructive' : 'default'}
              className="w-full"
            >
              {isSimulating ? (
                <>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Simulation
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Data Preview</CardTitle>
            <CardDescription>Real-time data from connected devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[100px]">
              <SimulationChart isSimulating={isSimulating} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Simulation completed successfully</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Hardware device STM32-01 connected</p>
                <p className="text-xs text-muted-foreground">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">System parameters updated</p>
                <p className="text-xs text-muted-foreground">10 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}