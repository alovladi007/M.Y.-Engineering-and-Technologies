'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Zap, Battery, Cpu, ArrowLeft } from 'lucide-react'

const mockProjects = [
  {
    id: '1',
    name: 'SST 50kW Design',
    description: 'Solid-state transformer for grid applications',
    type: 'sst',
    status: 'completed',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'DC-DC Buck Converter',
    description: 'High-efficiency buck converter for battery charging',
    type: 'dcdc',
    status: 'simulating',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Three-Phase Inverter',
    description: 'Grid-tied inverter with active filtering',
    type: 'inverter',
    status: 'draft',
    updatedAt: new Date().toISOString(),
  },
]

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = mockProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 text-white hover:text-purple-400 transition-colors">
                <Zap className="h-8 w-8" />
                <span className="text-2xl font-bold">PowerFlow</span>
              </Link>
            </div>
            <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
            <p className="text-gray-400">Manage your power electronics designs</p>
          </div>
          <Link 
            href="/projects/new"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> New Project
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link 
              key={project.id} 
              href={`/projects/${project.id}`}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                {project.type === 'sst' && <Zap className="h-8 w-8 text-purple-400" />}
                {project.type === 'dcdc' && <Battery className="h-8 w-8 text-green-400" />}
                {project.type === 'inverter' && <Cpu className="h-8 w-8 text-blue-400" />}
                <span className={`text-xs px-3 py-1 rounded-full ${
                  project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  project.status === 'simulating' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {project.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {project.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{project.description}</p>
              <div className="text-xs text-gray-500">
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No projects found</p>
          </div>
        )}
      </div>
    </div>
  )
}

