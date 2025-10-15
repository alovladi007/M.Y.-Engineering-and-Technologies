'use client';

import { useWebSocket } from '@/lib/useWebSocket';
import { useQuery } from '@tanstack/react-query';
import { devicesApi, patientsApi, alertsApi, readingsApi } from '@/lib/api';
import { Activity, Users, AlertTriangle, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTime, getAlertColor, getSensorName, formatValue, getStatusColor } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { connected, readings, alerts, subscribeToDevice } = useWebSocket();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // Fetch overview data
  const { data: devicesData } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesApi.list({ page_size: 100 }),
  });

  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientsApi.list({ page_size: 100 }),
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.list({ page_size: 50, acknowledged: false }),
  });

  const { data: readingsStats } = useQuery({
    queryKey: ['readings-stats'],
    queryFn: () => readingsApi.getStatistics(),
  });

  // Subscribe to first online device for demo
  useEffect(() => {
    if (devicesData?.data && devicesData.data.length > 0 && !selectedDevice) {
      const onlineDevice = devicesData.data.find((d: any) => d.status === 'online');
      if (onlineDevice) {
        subscribeToDevice(onlineDevice.id);
        setSelectedDevice(onlineDevice.id);
      }
    }
  }, [devicesData, selectedDevice, subscribeToDevice]);

  // Prepare chart data from recent readings
  const chartData = readings.slice(0, 20).reverse().map((reading) => ({
    time: formatTime(reading.timestamp),
    value: reading.value,
    sensor: getSensorName(reading.sensor_type),
  }));

  const stats = [
    {
      name: 'Total Devices',
      value: devicesData?.pagination?.total || 0,
      icon: Activity,
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Active Patients',
      value: patientsData?.pagination?.total || 0,
      icon: Users,
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: 'Active Alerts',
      value: alertsData?.pagination?.total || 0,
      icon: AlertTriangle,
      change: '-8%',
      changeType: 'decrease',
    },
    {
      name: 'Total Readings',
      value: readingsStats?.data?.total_readings || 0,
      icon: TrendingUp,
      change: '+23%',
      changeType: 'increase',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-time Monitoring Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor biosensor data in real-time across all connected devices
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {connected ? (
            <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <Wifi className="h-5 w-5 mr-2" />
              <span className="font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <WifiOff className="h-5 w-5 mr-2" />
              <span className="font-medium">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value.toLocaleString()}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Real-time Biosensor Data
            {selectedDevice && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Device: {selectedDevice.substring(0, 8)}...)
              </span>
            )}
          </h2>
          {connected && readings.length > 0 && (
            <span className="flex items-center text-sm text-green-600">
              <span className="animate-pulse-live mr-2 h-2 w-2 rounded-full bg-green-600"></span>
              Live
            </span>
          )}
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No real-time data available</p>
              <p className="text-sm mt-2">Connect a device to start monitoring</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Alerts and Readings Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.slice(0, 5).map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Device {alert.deviceId.substring(0, 8)}
                      {alert.patientId && (
                        <span className="text-gray-500 ml-2">
                          (Patient {alert.patientId.substring(0, 8)})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {alert.alert?.message || 'Alert triggered'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No recent alerts</p>
            )}
          </div>
        </div>

        {/* Recent Readings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Readings</h2>
          <div className="space-y-3">
            {readings.length > 0 ? (
              readings.slice(0, 5).map((reading, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getSensorName(reading.sensor_type)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(reading.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatValue(reading.value, reading.unit)}
                    </p>
                    {reading.is_anomaly && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Anomaly
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No recent readings</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
