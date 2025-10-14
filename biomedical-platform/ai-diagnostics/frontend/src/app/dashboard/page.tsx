'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalDiagnostics: 1247,
    pendingReviews: 23,
    highRiskPatients: 8,
    accuracy: 99.7,
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
              <Link href="/dashboard" className="text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/diagnostics/new" className="text-gray-700 hover:text-blue-600">
                New Analysis
              </Link>
              <Link href="/patients" className="text-gray-700 hover:text-blue-600">
                Patients
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Diagnostics</span>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalDiagnostics}</div>
            <p className="text-green-600 text-sm mt-2">+12% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Pending Reviews</span>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</div>
            <p className="text-gray-600 text-sm mt-2">Requires attention</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">High Risk Patients</span>
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.highRiskPatients}</div>
            <p className="text-red-600 text-sm mt-2">Monitor closely</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Accuracy</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.accuracy}%</div>
            <p className="text-green-600 text-sm mt-2">Above target</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recent Diagnostics</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">Patient #{10000 + i}</p>
                    <p className="text-sm text-gray-600">Type 2 Diabetes Risk Assessment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{i} hours ago</p>
                    <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
