'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { diagnosticsApi } from '@/lib/api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

interface PatientHistoryProps {
  params: {
    id: string
  }
}

export default function PatientHistory({ params }: PatientHistoryProps) {
  const {
    data: diagnosticsData,
    isLoading: diagnosticsLoading,
    error: diagnosticsError,
  } = useQuery({
    queryKey: ['patient-diagnostics', params.id],
    queryFn: () => diagnosticsApi.getByPatient(params.id),
  })

  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ['patient-history', params.id],
    queryFn: () => diagnosticsApi.getHistory(params.id),
  })

  const isLoading = diagnosticsLoading || historyLoading
  const error = diagnosticsError || historyError

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading patient history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Patient Data</h2>
          <p className="text-gray-600">{(error as any).message}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const diagnostics = diagnosticsData?.data?.diagnostics || []
  const history = historyData?.data || {}
  const trends = history.trends || {}

  // Prepare trend data for charts
  const riskTrendData = (trends.riskScores || []).map((point: any) => ({
    date: new Date(point.timestamp).toLocaleDateString(),
    cvd: point.cardiovascularDisease || 0,
    diabetes: point.diabetes || 0,
    cancer: point.cancer || 0,
  }))

  const biomarkerTrendData = (trends.biomarkers || []).map((point: any) => ({
    date: new Date(point.timestamp).toLocaleDateString(),
    glucose: point.glucose || 0,
    cholesterol: point.cholesterol || 0,
    bloodPressure: point.systolicBP || 0,
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 text-red-800'
      case 'urgent':
        return 'bg-yellow-100 text-yellow-800'
      case 'routine':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Patient History</h1>
          <p className="text-gray-600 mt-1">Patient ID: {params.id}</p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Diagnostics</span>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{diagnostics.length}</div>
            <p className="text-gray-600 text-sm mt-2">All time</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Recent Diagnostics</span>
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {diagnostics.filter((d: any) => {
                const date = new Date(d.createdAt)
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                return date >= thirtyDaysAgo
              }).length}
            </div>
            <p className="text-gray-600 text-sm mt-2">Last 30 days</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">High Risk Findings</span>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {diagnostics.filter((d: any) => d.result?.riskScores?.some((r: any) => r.category === 'high')).length}
            </div>
            <p className="text-red-600 text-sm mt-2">Requires attention</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Average Risk Trend</span>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {trends.averageRiskTrend || 'N/A'}
            </div>
            <p className={`text-sm mt-2 ${trends.averageRiskTrend === 'increasing' ? 'text-red-600' : 'text-green-600'}`}>
              {trends.averageRiskTrend === 'increasing' ? 'Increasing' : 'Stable/Decreasing'}
            </p>
          </div>
        </div>

        {/* Risk Score Trends */}
        {riskTrendData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Risk Score Trends Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cvd"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Cardiovascular Disease"
                />
                <Line type="monotone" dataKey="diabetes" stroke="#f59e0b" strokeWidth={2} name="Diabetes" />
                <Line type="monotone" dataKey="cancer" stroke="#8b5cf6" strokeWidth={2} name="Cancer" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Biomarker Trends */}
        {biomarkerTrendData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Biomarker Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={biomarkerTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="glucose"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Glucose (mg/dL)"
                />
                <Area
                  type="monotone"
                  dataKey="cholesterol"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  name="Cholesterol (mg/dL)"
                />
                <Area
                  type="monotone"
                  dataKey="bloodPressure"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                  name="Systolic BP (mmHg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Diagnostic History Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Diagnostic History</h2>
            <Link
              href={`/diagnostics/new?patientId=${params.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              New Diagnostic
            </Link>
          </div>

          {diagnostics.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No diagnostic history available</p>
              <Link
                href={`/diagnostics/new?patientId=${params.id}`}
                className="mt-4 inline-block text-blue-600 hover:text-blue-800"
              >
                Create first diagnostic
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {diagnostics.map((diagnostic: any) => (
                <Link
                  key={diagnostic.id}
                  href={`/diagnostics/${diagnostic.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {diagnostic.requestType.replace(/_/g, ' ').toUpperCase()}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(diagnostic.status)}`}>
                          {diagnostic.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(diagnostic.urgency)}`}>
                          {diagnostic.urgency}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(diagnostic.createdAt).toLocaleDateString()}
                        </span>
                        <span>ID: {diagnostic.id.slice(0, 8)}</span>
                      </div>

                      {diagnostic.result && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <span className="ml-2 font-medium">
                              {(diagnostic.result.predictions?.overallConfidence * 100 || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Conditions:</span>
                            <span className="ml-2 font-medium">
                              {Object.keys(diagnostic.result.predictions?.diseases || {}).length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">High Risks:</span>
                            <span className="ml-2 font-medium text-red-600">
                              {diagnostic.result.riskScores?.filter((r: any) => r.category === 'high').length || 0}
                            </span>
                          </div>
                        </div>
                      )}

                      {diagnostic.result?.clinicalDecisionSupport?.alerts && diagnostic.result.clinicalDecisionSupport.alerts.length > 0 && (
                        <div className="mt-3 flex items-start gap-2 bg-red-50 p-2 rounded">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <span className="text-sm text-red-800">
                            {diagnostic.result.clinicalDecisionSupport.alerts.length} critical alert(s)
                          </span>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Key Findings Summary */}
        {history.keyFindings && history.keyFindings.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Key Findings Summary</h2>
            <div className="space-y-3">
              {history.keyFindings.map((finding: any, index: number) => (
                <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{finding.condition}</h3>
                      <p className="text-gray-600 text-sm mt-1">{finding.description}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        First detected: {new Date(finding.firstDetected).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        finding.severity === 'high'
                          ? 'bg-red-100 text-red-800'
                          : finding.severity === 'moderate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {finding.severity?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link
            href="/patients"
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Back to Patients
          </Link>
          <Link
            href={`/diagnostics/new?patientId=${params.id}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            New Diagnostic Analysis
          </Link>
        </div>
      </main>
    </div>
  )
}
