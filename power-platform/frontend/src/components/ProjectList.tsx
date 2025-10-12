import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface ProjectListProps {
  projects: Project[];
  onProjectClick?: (projectId: number) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectClick }) => {
  const navigate = useNavigate();

  const handleClick = (projectId: number) => {
    if (onProjectClick) {
      onProjectClick(projectId);
    } else {
      navigate(`/project/${projectId}`);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No projects yet</p>
        <button
          onClick={() => navigate('/new-project')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create First Project
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => handleClick(project.id)}
          className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-750 transition-colors border border-gray-700 hover:border-gray-600"
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-400 mb-4">
              {project.description}
            </p>
          )}
          <div className="text-xs text-gray-500">
            Created {new Date(project.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};
