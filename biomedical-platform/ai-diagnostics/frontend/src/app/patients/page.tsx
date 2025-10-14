'use client'

import { useState } from 'react'
import { Activity, Search, UserPlus, ChevronRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Mock patient data - in production, this would come from the API
const mockPatients = [
  {
    id: 'patient-001',
    name: 'John Doe',
    age: 54,
    gender: 'Male',
    lastVisit: '2025-10-12',
    diagnosticCount: 12,
    highRiskCount: 2,
    status: 'active',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
  },
  {
    id: 'patient-002',
    name: 'Jane Smith',
    age: 42,
    gender: 'Female',
    lastVisit: '2025-10-10',
    diagnosticCount: 8,
    highRiskCount: 0,
    status: 'active',
    conditions: ['Asthma'],
  },
  {
    id: 'patient-003',
    name: 'Robert Johnson',
    age: 67,
    gender: 'Male',
    lastVisit: '2025-10-08',
    diagnosticCount: 24,
    highRiskCount: 5,
    status: 'monitoring',
    conditions: ['Cardiovascular Disease', 'Type 2 Diabetes', 'High Cholesterol'],
  },
  {
    id: 'patient-004',
    name: 'Maria Garcia',
    age: 35,
    gender: 'Female',
    lastVisit: '2025-10-14',
    diagnosticCount: 5,
    highRiskCount: 0,
    status: 'active',
    conditions: [],
  },
  {
    id: 'patient-005',
    name: 'David Lee',
    age: 58,
    gender: 'Male',
    lastVisit: '2025-09-28',
    diagnosticCount: 15,
    highRiskCount: 3,
    status: 'monitoring',
    conditions: ['Obesity', 'Pre-diabetes'],
  },
]

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'monitoring'>('all')

  const filteredPatients = mockPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskBadge = (count: number) => {
    if (count === 0) return null
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
        <AlertCircle className="h-3 w-3" />
        {count} high risk
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">AI Diagnostics</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/diagnostics/new" className="text-gray-700 hover:text-blue-600">
                New Analysis
              </Link>
              <Link href="/patients" className="text-blue-600 font-medium">
                Patients
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600 mt-1">Manage patient records and view diagnostic history</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <UserPlus className="h-5 w-5" />
            Add Patient
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Patients</div>
            <div className="text-3xl font-bold text-gray-900">{mockPatients.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Patients</div>
            <div className="text-3xl font-bold text-green-600">
              {mockPatients.filter((p) => p.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Under Monitoring</div>
            <div className="text-3xl font-bold text-yellow-600">
              {mockPatients.filter((p) => p.status === 'monitoring').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">High Risk Alerts</div>
            <div className="text-3xl font-bold text-red-600">
              {mockPatients.reduce((sum, p) => sum + p.highRiskCount, 0)}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or patient ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  statusFilter === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('monitoring')}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  statusFilter === 'monitoring'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monitoring
              </button>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No patients found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="block hover:bg-gray-50 transition"
                >
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                        {getRiskBadge(patient.highRiskCount)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="text-gray-500">ID:</span> {patient.id}
                        </div>
                        <div>
                          <span className="text-gray-500">Age:</span> {patient.age} years
                        </div>
                        <div>
                          <span className="text-gray-500">Gender:</span> {patient.gender}
                        </div>
                        <div>
                          <span className="text-gray-500">Last Visit:</span>{' '}
                          {new Date(patient.lastVisit).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-600">
                          <span className="font-medium text-gray-900">{patient.diagnosticCount}</span> diagnostics
                        </span>
                        {patient.conditions.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-gray-500">Conditions:</span>
                            {patient.conditions.slice(0, 2).map((condition, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                              >
                                {condition}
                              </span>
                            ))}
                            {patient.conditions.length > 2 && (
                              <span className="text-gray-500 text-xs">
                                +{patient.conditions.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredPatients.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredPatients.length} of {mockPatients.length} patients
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
