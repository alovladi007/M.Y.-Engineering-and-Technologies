'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Download, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { diagnosticsApi } from '@/lib/api'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DiagnosticResultsProps {
  params: {
    id: string
  }
}

export default function DiagnosticResults({ params }: DiagnosticResultsProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'json'>('pdf')
  const [isExporting, setIsExporting] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['diagnostic', params.id],
    queryFn: () => diagnosticsApi.getById(params.id),
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await diagnosticsApi.export(params.id, exportFormat)
      // Handle download
      const blob = new Blob([JSON.stringify(response.data)], {
        type: exportFormat === 'pdf' ? 'application/pdf' : 'application/json',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diagnostic-${params.id}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading diagnostic results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600">{(error as any).message}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const result = data?.data?.result || {}
  const predictions = result.predictions || {}
  const riskScores = result.riskScores || []
  const clinicalSupport = result.clinicalDecisionSupport || {}
  const drugDiscovery = result.drugDiscovery || {}

  // Prepare chart data
  const confidenceData = Object.entries(predictions.diseases || {}).map(([disease, data]: [string, any]) => ({
    disease: disease.replace(/_/g, ' '),
    confidence: (data.confidence * 100).toFixed(1),
  }))

  const riskChartData = riskScores.map((risk: any) => ({
    condition: risk.condition,
    score: risk.score,
    threshold: risk.category === 'high' ? 70 : risk.category === 'moderate' ? 40 : 20,
  }))

  const biomarkerData = Object.entries(predictions.biomarkers || {}).map(([biomarker, data]: [string, any]) => ({
    biomarker: biomarker,
    level: data.level,
    normal: data.normalRange?.max || 100,
  }))

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
              <Link href="/patients" className="text-gray-700 hover:text-blue-600">
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
            <h1 className="text-3xl font-bold text-gray-900">Diagnostic Results</h1>
            <p className="text-gray-600 mt-1">Analysis ID: {params.id}</p>
            <p className="text-sm text-gray-500 mt-1">
              Generated: {new Date(data?.data?.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'json')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              Export
            </button>
          </div>
        </div>

        {/* Critical Alerts */}
        {clinicalSupport.alerts && clinicalSupport.alerts.length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Critical Alerts</h3>
                <ul className="space-y-1">
                  {clinicalSupport.alerts.map((alert: any, index: number) => (
                    <li key={index} className="text-red-800">
                      <span className="font-medium">{alert.severity.toUpperCase()}:</span> {alert.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Overall Confidence</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {(predictions.overallConfidence * 100 || 0).toFixed(1)}%
            </div>
            <p className="text-green-600 text-sm mt-2">High confidence analysis</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Conditions Detected</span>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {Object.keys(predictions.diseases || {}).length}
            </div>
            <p className="text-gray-600 text-sm mt-2">Requiring review</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">High Risk Factors</span>
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {riskScores.filter((r: any) => r.category === 'high').length}
            </div>
            <p className="text-red-600 text-sm mt-2">Immediate attention needed</p>
          </div>
        </div>

        {/* Disease Detection */}
        {confidenceData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Disease Detection Confidence</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="disease" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="confidence" fill="#3b82f6" name="Confidence (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Risk Assessment */}
        {riskChartData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment Scores</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="condition" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#ef4444" name="Risk Score" />
                <Bar dataKey="threshold" fill="#94a3b8" name="Threshold" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {riskScores.map((risk: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <span className="font-medium">{risk.condition}</span>
                    <span className="text-gray-600 text-sm ml-2">({risk.timeframe})</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      risk.category === 'high'
                        ? 'bg-red-100 text-red-800'
                        : risk.category === 'moderate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {risk.category.toUpperCase()} ({risk.score.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Biomarker Analysis */}
        {biomarkerData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Biomarker Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={biomarkerData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="biomarker" />
                <PolarRadiusAxis />
                <Radar name="Current Level" dataKey="level" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="Normal Range" dataKey="normal" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Clinical Decision Support */}
        {clinicalSupport.treatmentRecommendations && clinicalSupport.treatmentRecommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Treatment Recommendations</h2>
            <div className="space-y-4">
              {clinicalSupport.treatmentRecommendations.map((rec: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900">{rec.intervention}</h3>
                  <p className="text-gray-600 text-sm mt-1">{rec.rationale}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-500">Priority: {rec.priority}</span>
                    <span className="text-gray-500">Evidence Level: {rec.evidenceLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Guidelines */}
        {clinicalSupport.guidelines && clinicalSupport.guidelines.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Relevant Clinical Guidelines</h2>
            <div className="space-y-3">
              {clinicalSupport.guidelines.map((guideline: any, index: number) => (
                <div key={index} className="p-4 bg-blue-50 rounded-md">
                  <h3 className="font-semibold text-blue-900">{guideline.title}</h3>
                  <p className="text-blue-800 text-sm mt-1">{guideline.recommendation}</p>
                  <p className="text-blue-600 text-xs mt-2">Source: {guideline.source}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drug Interactions */}
        {clinicalSupport.drugInteractions && clinicalSupport.drugInteractions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Potential Drug Interactions</h2>
            <div className="space-y-3">
              {clinicalSupport.drugInteractions.map((interaction: any, index: number) => (
                <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900">
                        {interaction.drug1} + {interaction.drug2}
                      </h3>
                      <p className="text-yellow-800 text-sm mt-1">{interaction.description}</p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          interaction.severity === 'high'
                            ? 'bg-red-100 text-red-800'
                            : interaction.severity === 'moderate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {interaction.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drug Discovery Insights */}
        {drugDiscovery.candidateCompounds && drugDiscovery.candidateCompounds.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Candidate Drug Compounds</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compound
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Binding Affinity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Safety Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drugDiscovery.candidateCompounds.map((compound: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {compound.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {compound.target}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {compound.bindingAffinity} nM
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            compound.safetyScore > 0.8
                              ? 'bg-green-100 text-green-800'
                              : compound.safetyScore > 0.6
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {(compound.safetyScore * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Patient Education */}
        {clinicalSupport.patientEducation && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Patient Education Materials</h2>
            <div className="prose max-w-none">
              <div className="space-y-3">
                {clinicalSupport.patientEducation.map((education: any, index: number) => (
                  <div key={index} className="p-4 bg-green-50 rounded-md">
                    <h3 className="font-semibold text-green-900">{education.topic}</h3>
                    <p className="text-green-800 text-sm mt-2">{education.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
          <Link
            href={`/patients/${data?.data?.patientId}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            View Patient History
          </Link>
        </div>
      </main>
    </div>
  )
}
