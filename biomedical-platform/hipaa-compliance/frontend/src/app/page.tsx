'use client';

import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '@/lib/api';
import { FileText, Users, ShieldCheck, TrendingUp } from 'lucide-react';
import { formatDateTime, getSeverityColor } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export default function AuditLogsPage() {
  // Fetch audit logs
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditLogsApi.list({ page: 1, page_size: 50 }),
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => auditLogsApi.getStatistics({ days: 30 }),
  });

  const stats = statsData?.data || {};

  const statCards = [
    {
      name: 'Total Logs (30d)',
      value: stats.totalLogs || 0,
      icon: FileText,
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'PHI Access',
      value: stats.phiAccessCount || 0,
      icon: ShieldCheck,
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: 'Failed Access',
      value: stats.failedAccessCount || 0,
      icon: Users,
      change: '-8%',
      changeType: 'decrease',
    },
    {
      name: 'Compliance Rate',
      value: `${stats.complianceRate?.toFixed(1) || 100}%`,
      icon: TrendingUp,
      change: '+2%',
      changeType: 'increase',
    },
  ];

  // Prepare chart data
  const actionChartData = Object.entries(stats.byAction || {}).map(
    ([action, count]) => ({
      action,
      count,
    })
  );

  const resourceChartData = Object.entries(stats.byResource || {}).map(
    ([resource, count]) => ({
      name: resource,
      value: count as number,
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          HIPAA-compliant audit trail and compliance monitoring
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Actions Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions by Type
          </h2>
          {actionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={actionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="action" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Resources Pie Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resources Accessed
          </h2>
          {resourceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resourceChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Audit Logs
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PHI Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : logsData?.data?.length > 0 ? (
                logsData.data.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.userName || log.userId || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.phi_accessed ? (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.success ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Success
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
