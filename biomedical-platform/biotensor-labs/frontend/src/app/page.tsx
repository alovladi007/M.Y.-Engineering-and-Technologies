'use client';

import { useQuery } from '@tanstack/react-query';
import { experimentsApi, modelsApi } from '@/lib/api';
import { FlaskConical, GitBranch, PlayCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: experiments, isLoading } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => experimentsApi.list({ max_results: 100 }),
  });

  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: () => modelsApi.list(),
  });

  const stats = [
    {
      name: 'Total Experiments',
      value: experiments?.length || 0,
      icon: FlaskConical,
    },
    {
      name: 'Registered Models',
      value: modelsData?.models?.length || 0,
      icon: Package,
    },
    {
      name: 'Active Runs',
      value: 0,
      icon: PlayCircle,
    },
    {
      name: 'Model Versions',
      value: 0,
      icon: GitBranch,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">BioTensor Labs Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          MLOps platform for biomedical signal processing and experiment tracking
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
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
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Experiments */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Experiments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : experiments && experiments.length > 0 ? (
                experiments.slice(0, 10).map((exp: any) => (
                  <tr key={exp.experiment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {exp.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exp.experiment_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exp.creation_time).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/experiments/${exp.experiment_id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No experiments found
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
