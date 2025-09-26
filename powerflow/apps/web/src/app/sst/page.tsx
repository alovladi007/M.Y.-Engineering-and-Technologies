'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Zap, Settings, Activity, TrendingUp, Cpu, Database } from 'lucide-react'
import dynamic from 'next/dynamic'

const SimulationChart = dynamic(() => import('@/components/simulation-chart'), { ssr: false })

export default function SST() {
  const [selectedChain, setSelectedChain] = useState(['NPC3L', 'DAB', 'INV'])
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResults, setSimulationResults] = useState<any>(null)

  const stageOptions = [
    { id: 'NPC3L', name: '3-Level NPC Rectifier', description: 'AC-DC with LCL filter' },
    { id: 'DAB', name: 'Dual Active Bridge', description: 'MV/LV isolation with MFT' },
    { id: 'INV', name: 'Grid-Tie Inverter', description: 'DC-AC grid connection' },
    { id: 'DC', name: 'DC Bus Regulator', description: 'Regulated DC output' }
  ]

  const deviceOptions = [
    { id: 'sic-1', name: 'C2M0080120D', tech: 'SiC', vds: 1200, rds: 0.080, efficiency: '96.2%' },
    { id: 'gan-1', name: 'GS-065-011-1-L', tech: 'GaN', vds: 650, rds: 0.025, efficiency: '97.1%' },
    { id: 'sic-2', name: 'C3M0075120K', tech: 'SiC', vds: 1200, rds: 0.075, efficiency: '96.4%' }
  ]

  const coreOptions = [
    { id: 'core-1', vendor: 'Ferroxcube', type: 'ETD49', ae: 2.11, ve: 12.7 },
    { id: 'core-2', vendor: 'TDK', type: 'EE42/21/20', ae: 1.81, ve: 11.2 }
  ]

  const startSimulation = async () => {
    setIsSimulating(true)
    
    // Mock simulation call
    setTimeout(() => {
      setSimulationResults({
        efficiency: 94.8,
        zvsMargin: 22.3,
        coreLoss: 24.7,
        switchingLoss: 18.2,
        thermalMap: [
          { component: 'Primary Switch', temperature: 52.3 },
          { component: 'Secondary Switch', temperature: 48.1 },
          { component: 'MFT Core', temperature: 41.2 },
          { component: 'MFT Winding', temperature: 45.8 }
        ]
      })
      setIsSimulating(false)
    }, 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Solid-State Transformer (SST)</h1>
        <p className="text-muted-foreground">Design and simulate medium-frequency SST chains for EV charging and renewables</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chain Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.8%</div>
            <p className="text-xs text-muted-foreground">3-stage cascade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ZVS Margin</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">22.3%</div>
            <p className="text-xs text-muted-foreground">Safe operating zone</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MFT Frequency</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5 kHz</div>
            <p className="text-xs text-muted-foreground">Medium frequency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Power Rating</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">350 kW</div>
            <p className="text-xs text-muted-foreground">DCFC application</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="design" className="space-y-4">
        <TabsList>
          <TabsTrigger value="design">Chain Builder</TabsTrigger>
          <TabsTrigger value="mft">MFT Designer</TabsTrigger>
          <TabsTrigger value="devices">Device Chooser</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SST Chain Configuration</CardTitle>
              <CardDescription>Build your solid-state transformer chain by selecting stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Chain</h3>
                  <div className="flex items-center space-x-4">
                    {selectedChain.map((stage, index) => (
                      <div key={index} className="flex items-center">
                        <Badge variant="default" className="px-4 py-2">
                          {stage}
                        </Badge>
                        {index < selectedChain.length - 1 && (
                          <div className="mx-2 text-muted-foreground">→</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Available Stages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stageOptions.map((stage) => (
                      <Card key={stage.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{stage.name}</CardTitle>
                            <Badge variant="outline">{stage.id}</Badge>
                          </div>
                          <CardDescription>{stage.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedChain([...selectedChain, stage.id])}
                          >
                            Add to Chain
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stage 1: AC-DC</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Input Voltage</span>
                        <span className="text-sm font-medium">4.16 kV AC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Output Voltage</span>
                        <span className="text-sm font-medium">800 V DC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Topology</span>
                        <span className="text-sm font-medium">3L-NPC</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stage 2: DAB</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Primary</span>
                        <span className="text-sm font-medium">800 V DC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Secondary</span>
                        <span className="text-sm font-medium">950 V DC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Frequency</span>
                        <span className="text-sm font-medium">87.5 kHz</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stage 3: DC Output</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Output Voltage</span>
                        <span className="text-sm font-medium">400-1000 V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Current</span>
                        <span className="text-sm font-medium">0-350 A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Application</span>
                        <span className="text-sm font-medium">DCFC</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mft" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medium Frequency Transformer Designer</CardTitle>
              <CardDescription>Design and analyze the MFT for the DAB stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Core Selection</h3>
                    <div className="space-y-4">
                      {coreOptions.map((core) => (
                        <Card key={core.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{core.vendor} {core.type}</div>
                            <Badge variant="outline">Core</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Ae: {core.ae} cm²</div>
                            <div>Ve: {core.ve} cm³</div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Winding Design</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Primary Turns</label>
                        <input
                          type="number"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          defaultValue="12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Secondary Turns</label>
                        <input
                          type="number"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          defaultValue="14"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Operating Frequency (kHz)</label>
                        <input
                          type="number"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          defaultValue="87.5"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Leakage Inductance (µH)</label>
                        <input
                          type="number"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          defaultValue="2.8"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Loss Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">24.7 W</div>
                        <div className="text-sm text-muted-foreground">Core Loss</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">31.2 W</div>
                        <div className="text-sm text-muted-foreground">Copper Loss</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">98.4%</div>
                        <div className="text-sm text-muted-foreground">MFT Efficiency</div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SiC/GaN Device Comparison</CardTitle>
              <CardDescription>Select and compare switching devices for your SST design</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {deviceOptions.map((device) => (
                    <Card key={device.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold">{device.name}</div>
                        <Badge variant={device.tech === 'SiC' ? 'default' : 'secondary'}>
                          {device.tech}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Vds</span>
                          <span className="font-medium">{device.vds} V</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rds(on)</span>
                          <span className="font-medium">{device.rds} Ω</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Efficiency</span>
                          <span className="font-medium text-green-600">{device.efficiency}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Select Device
                      </Button>
                    </Card>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Device Curves Comparison</h3>
                  <div className="h-[300px] flex items-center justify-center border rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Zap className="h-12 w-12 mx-auto mb-2" />
                      <p>Device characteristic curves will be displayed here</p>
                      <p className="text-sm">Eon/Eoff, Qg, Coss vs voltage/current/temperature</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SST Simulation</CardTitle>
                  <CardDescription>Run complete 3-stage SST simulation</CardDescription>
                </div>
                <Button
                  onClick={startSimulation}
                  disabled={isSimulating}
                  className="px-6"
                >
                  {isSimulating ? 'Simulating...' : 'Start Simulation'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isSimulating && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Running SST simulation...</span>
                  </div>
                )}

                {simulationResults && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {simulationResults.efficiency.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Efficiency</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {simulationResults.zvsMargin.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">ZVS Margin</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {simulationResults.coreLoss.toFixed(1)} W
                        </div>
                        <div className="text-sm text-muted-foreground">Core Loss</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {simulationResults.switchingLoss.toFixed(1)} W
                        </div>
                        <div className="text-sm text-muted-foreground">Switching Loss</div>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Thermal Map</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {simulationResults.thermalMap.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <span className="font-medium">{item.component}</span>
                            <div className="text-right">
                              <span className="text-lg font-bold">{item.temperature.toFixed(1)}°C</span>
                              <div className={`text-xs ${item.temperature > 80 ? 'text-red-600' : item.temperature > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {item.temperature > 80 ? 'Hot' : item.temperature > 60 ? 'Warm' : 'Normal'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="h-[300px]">
                  <SimulationChart isSimulating={isSimulating} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SST Optimization</CardTitle>
              <CardDescription>AI-powered optimization for efficiency and ZVS operation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Target Efficiency (%)</label>
                    <input
                      type="number"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      defaultValue="95"
                      min="90"
                      max="98"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Power (kW)</label>
                    <input
                      type="number"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      defaultValue="350"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input type="checkbox" id="zvs" defaultChecked />
                    <label htmlFor="zvs" className="text-sm font-medium">Require ZVS Operation</label>
                  </div>
                </div>

                <Button className="w-full">Run Optimization</Button>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Optimization Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Recommended Parameters</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Switching Frequency</span>
                          <span className="font-medium">87.5 kHz</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phase Shift</span>
                          <span className="font-medium">28.7°</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Leakage Inductance</span>
                          <span className="font-medium">2.8 µH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Predicted Efficiency</span>
                          <span className="font-medium text-green-600">95.2%</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Device Recommendation</h4>
                      <div className="text-center">
                        <Badge className="mb-2">SiC</Badge>
                        <div className="font-medium">C2M0080120D</div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Optimal balance of efficiency and cost for this power level
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}