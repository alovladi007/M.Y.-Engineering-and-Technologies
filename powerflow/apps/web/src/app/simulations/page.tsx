'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayCircle, StopCircle, Settings } from 'lucide-react'
import dynamic from 'next/dynamic'

const SimulationChart = dynamic(() => import('@/components/simulation-chart'), { ssr: false })

export default function Simulations() {
  const [isSimulating, setIsSimulating] = useState(false)

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Simulations</h1>
        <p className="text-muted-foreground">Power electronics simulation and control</p>
      </div>

      <Tabs defaultValue="simulation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="control">Control Parameters</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Data</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Power Electronics Simulation</CardTitle>
                  <CardDescription>
                    Real-time simulation of DC-DC converter with MPPT control
                  </CardDescription>
                </div>
                <Button
                  onClick={toggleSimulation}
                  variant={isSimulating ? 'destructive' : 'default'}
                  size="lg"
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <SimulationChart isSimulating={isSimulating} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Input Voltage</span>
                  <span className="text-sm">48V DC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Output Voltage</span>
                  <span className="text-sm">12V DC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Switching Frequency</span>
                  <span className="text-sm">100 kHz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Control Method</span>
                  <span className="text-sm">MPPT (P&O)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Efficiency</span>
                  <span className="text-sm text-green-600">94.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">THD</span>
                  <span className="text-sm text-yellow-600">2.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ripple Voltage</span>
                  <span className="text-sm">120 mV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Temperature</span>
                  <span className="text-sm">45°C</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="control">
          <Card>
            <CardHeader>
              <CardTitle>Control Parameters Configuration</CardTitle>
              <CardDescription>
                Adjust PID and MPPT control parameters for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">PID Controller</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Kp (Proportional)</label>
                      <input
                        type="number"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        defaultValue="0.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ki (Integral)</label>
                      <input
                        type="number"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        defaultValue="0.1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Kd (Derivative)</label>
                      <input
                        type="number"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        defaultValue="0.05"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">MPPT Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Step Size</label>
                      <input
                        type="number"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        defaultValue="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Sample Rate (Hz)</label>
                      <input
                        type="number"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        defaultValue="10"
                      />
                    </div>
                  </div>
                </div>
                <Button className="w-full">Apply Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Data Stream</CardTitle>
              <CardDescription>Live data from connected hardware devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Real-time data visualization will appear here when hardware is connected
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>System Analysis</CardTitle>
              <CardDescription>Advanced analytics and ML predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Analysis tools and ML predictions will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}