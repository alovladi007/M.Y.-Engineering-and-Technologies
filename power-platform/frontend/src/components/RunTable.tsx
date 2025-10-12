import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Run {
  id: number;
  project_name: string;
  topology: string;
  status: string;
  efficiency?: number;
  started_at: string;
  finished_at?: string;
}

interface RunTableProps {
  runs: Run[];
}

const statusColors = {
  pending: 'bg-yellow-500',
  running: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

const statusLabels = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
};

export const RunTable: React.FC<RunTableProps> = ({ runs }) => {
  const navigate = useNavigate();

  if (runs.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No simulation runs yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Project
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Topology
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Efficiency
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Started
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {runs.map((run) => (
            <tr
              key={run.id}
              onClick={() => navigate(`/run/${run.id}`)}
              className="hover:bg-gray-750 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                #{run.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {run.project_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {run.topology}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${statusColors[run.status as keyof typeof statusColors] || 'bg-gray-500'}`}>
                  {statusLabels[run.status as keyof typeof statusLabels] || run.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {run.efficiency != null ? `${run.efficiency.toFixed(2)}%` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {new Date(run.started_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
