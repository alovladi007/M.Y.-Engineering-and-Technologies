import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects, runs as runsApi } from '../lib/api';
import { RunTable } from '../components/RunTable';

interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface Run {
  id: number;
  project_name: string;
  topology: string;
  status: string;
  efficiency?: number;
  started_at: string;
  finished_at?: string;
}

export const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadRuns();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data } = await projects.get(parseInt(projectId!));
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const loadRuns = async () => {
    try {
      const { data } = await runsApi.list({ project_id: parseInt(projectId!) });
      setRuns(data);
    } catch (error) {
      console.error('Failed to load runs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Project not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-gray-400">{project.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={() => navigate(`/new-run?project=${project.id}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            New Simulation
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-2">
            {runs.length}
          </div>
          <p className="text-gray-400 text-sm">Total Runs</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {runs.filter((r) => r.status === 'completed').length}
          </div>
          <p className="text-gray-400 text-sm">Completed</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {runs.filter((r) => r.status === 'running' || r.status === 'pending').length}
          </div>
          <p className="text-gray-400 text-sm">In Progress</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {runs.length > 0 && runs.some((r) => r.efficiency)
              ? (
                  runs
                    .filter((r) => r.efficiency)
                    .reduce((sum, r) => sum + (r.efficiency || 0), 0) /
                  runs.filter((r) => r.efficiency).length
                ).toFixed(1) + '%'
              : '-'}
          </div>
          <p className="text-gray-400 text-sm">Avg Efficiency</p>
        </div>
      </div>

      {/* Runs Table */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Simulation Runs</h2>
        <RunTable runs={runs} />
      </div>
    </div>
  );
};
