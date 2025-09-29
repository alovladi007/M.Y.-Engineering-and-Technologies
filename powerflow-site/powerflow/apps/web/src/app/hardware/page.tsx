'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cpu, Wifi, WifiOff, Settings, Power } from 'lucide-react'

export default function Hardware() {
  const [devices] = useState([
    {
      id: 'stm32-01',
      name: 'STM32F4 Discovery',
      type: 'Microcontroller',
      status: 'connected',
      ip: '192.168.1.101',
      lastSeen: '2 seconds ago'
    },
    {
      id: 'stm32-02',
      name: 'STM32H7 Nucleo',
      type: 'Microcontroller',
      status: 'connected',
      ip: '192.168.1.102',
      lastSeen: '5 seconds ago'
    },
    {
      id: 'rpi-01',
      name: 'Raspberry Pi 4',
      type: 'Single Board Computer',
      status: 'connected',
      ip: '192.168.1.103',
      lastSeen: '1 second ago'
    },
    {
      id: 'arduino-01',
      name: 'Arduino Uno',
      type: 'Microcontroller',
      status: 'disconnected',
      ip: null,
      lastSeen: '2 hours ago'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'disconnected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    return status === 'connected' ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hardware Devices</h1>
        <p className="text-muted-foreground">Manage and monitor connected hardware devices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground">Hardware devices registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {devices.filter(d => d.status === 'connected').length}
            </div>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {devices.filter(d => d.status === 'disconnected').length}
            </div>
            <p className="text-xs text-muted-foreground">Disconnected devices</p>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle>Device Manager</CardTitle>
          <CardDescription>Monitor and control your hardware devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></div>
                  <div>
                    <h3 className="font-semibold">{device.name}</h3>
                    <p className="text-sm text-muted-foreground">{device.type}</p>
                    {device.ip && (
                      <p className="text-xs text-muted-foreground">IP: {device.ip}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge variant={device.status === 'connected' ? 'default' : 'secondary'} className="flex items-center space-x-1">
                      {getStatusIcon(device.status)}
                      <span>{device.status}</span>
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last seen: {device.lastSeen}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={device.status === 'disconnected'}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={device.status === 'connected' ? 'destructive' : 'default'}
                      size="sm"
                    >
                      {device.status === 'connected' ? (
                        <>
                          <Power className="h-4 w-4 mr-2" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Device */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add New Device</CardTitle>
          <CardDescription>Register a new hardware device to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Device Name</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter device name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Device Type</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md">
                <option>Microcontroller</option>
                <option>Single Board Computer</option>
                <option>FPGA</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">IP Address</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="192.168.1.100"
              />
            </div>
          </div>
          <Button className="mt-4">Add Device</Button>
        </CardContent>
      </Card>
    </div>
  )
}