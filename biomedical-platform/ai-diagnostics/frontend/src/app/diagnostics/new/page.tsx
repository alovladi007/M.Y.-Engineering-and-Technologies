'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Activity, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { diagnosticsApi } from '@/lib/api'

interface LabResult {
  testName: string
  value: string
  unit: string
  referenceRange: string
}

interface VitalSigns {
  bloodPressure: string
  heartRate: string
  temperature: string
  respiratoryRate: string
  oxygenSaturation: string
}

interface DiagnosticFormData {
  patientId: string
  requestType: string
  urgency: 'routine' | 'urgent' | 'emergency'
  labResults: LabResult[]
  vitalSigns: VitalSigns
  symptoms: string[]
  medications: string[]
  medicalHistory: string[]
  allergies: string[]
  notes: string
}

export default function NewDiagnostic() {
  const router = useRouter()
  const [formData, setFormData] = useState<DiagnosticFormData>({
    patientId: '',
    requestType: 'disease_detection',
    urgency: 'routine',
    labResults: [],
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
    },
    symptoms: [],
    medications: [],
    medicalHistory: [],
    allergies: [],
    notes: '',
  })

  const [currentLabResult, setCurrentLabResult] = useState<LabResult>({
    testName: '',
    value: '',
    unit: '',
    referenceRange: '',
  })

  const [currentSymptom, setCurrentSymptom] = useState('')
  const [currentMedication, setCurrentMedication] = useState('')
  const [currentCondition, setCurrentCondition] = useState('')
  const [currentAllergy, setCurrentAllergy] = useState('')

  const analyzeMutation = useMutation({
    mutationFn: (data: DiagnosticFormData) => diagnosticsApi.analyze(data),
    onSuccess: (response) => {
      router.push(`/diagnostics/${response.data.id}`)
    },
  })

  const handleAddLabResult = () => {
    if (currentLabResult.testName && currentLabResult.value) {
      setFormData({
        ...formData,
        labResults: [...formData.labResults, currentLabResult],
      })
      setCurrentLabResult({ testName: '', value: '', unit: '', referenceRange: '' })
    }
  }

  const handleRemoveLabResult = (index: number) => {
    setFormData({
      ...formData,
      labResults: formData.labResults.filter((_, i) => i !== index),
    })
  }

  const handleAddSymptom = () => {
    if (currentSymptom.trim()) {
      setFormData({
        ...formData,
        symptoms: [...formData.symptoms, currentSymptom.trim()],
      })
      setCurrentSymptom('')
    }
  }

  const handleAddMedication = () => {
    if (currentMedication.trim()) {
      setFormData({
        ...formData,
        medications: [...formData.medications, currentMedication.trim()],
      })
      setCurrentMedication('')
    }
  }

  const handleAddCondition = () => {
    if (currentCondition.trim()) {
      setFormData({
        ...formData,
        medicalHistory: [...formData.medicalHistory, currentCondition.trim()],
      })
      setCurrentCondition('')
    }
  }

  const handleAddAllergy = () => {
    if (currentAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, currentAllergy.trim()],
      })
      setCurrentAllergy('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Prepare data for API
    const apiData = {
      patientId: formData.patientId,
      requestType: formData.requestType,
      urgency: formData.urgency,
      inputData: {
        labResults: formData.labResults,
        vitalSigns: formData.vitalSigns,
        symptoms: formData.symptoms,
        medications: formData.medications,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
        additionalNotes: formData.notes,
      },
    }

    analyzeMutation.mutate(apiData as any)
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
              <Link href="/diagnostics/new" className="text-blue-600 font-medium">
                New Analysis
              </Link>
              <Link href="/patients" className="text-gray-700 hover:text-blue-600">
                Patients
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">New Diagnostic Analysis</h1>
          <p className="text-gray-600 mt-2">
            Enter patient data to generate AI-powered diagnostic insights
          </p>
        </div>

        {analyzeMutation.isError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-red-900">Analysis Failed</h3>
              <p className="text-red-700 text-sm mt-1">
                {(analyzeMutation.error as any)?.response?.data?.error || 'An error occurred during analysis'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., PAT-123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Type *
                </label>
                <select
                  required
                  value={formData.requestType}
                  onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="disease_detection">Disease Detection</option>
                  <option value="risk_assessment">Risk Assessment</option>
                  <option value="drug_discovery">Drug Discovery Support</option>
                  <option value="clinical_decision_support">Clinical Decision Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency *
                </label>
                <select
                  required
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Vital Signs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure (mmHg)
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.bloodPressure}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitalSigns: { ...formData.vitalSigns, bloodPressure: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 120/80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heart Rate (bpm)
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.heartRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitalSigns: { ...formData.vitalSigns, heartRate: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°F)
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitalSigns: { ...formData.vitalSigns, temperature: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 98.6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respiratory Rate (breaths/min)
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.respiratoryRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitalSigns: { ...formData.vitalSigns, respiratoryRate: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 16"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oxygen Saturation (%)
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.oxygenSaturation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitalSigns: { ...formData.vitalSigns, oxygenSaturation: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 98"
                />
              </div>
            </div>
          </div>

          {/* Lab Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Laboratory Results</h2>
            <div className="mb-4">
              <div className="grid md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={currentLabResult.testName}
                  onChange={(e) =>
                    setCurrentLabResult({ ...currentLabResult, testName: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Test Name"
                />
                <input
                  type="text"
                  value={currentLabResult.value}
                  onChange={(e) =>
                    setCurrentLabResult({ ...currentLabResult, value: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Value"
                />
                <input
                  type="text"
                  value={currentLabResult.unit}
                  onChange={(e) =>
                    setCurrentLabResult({ ...currentLabResult, unit: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Unit"
                />
                <input
                  type="text"
                  value={currentLabResult.referenceRange}
                  onChange={(e) =>
                    setCurrentLabResult({ ...currentLabResult, referenceRange: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Reference Range"
                />
              </div>
              <button
                type="button"
                onClick={handleAddLabResult}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Lab Result
              </button>
            </div>
            {formData.labResults.length > 0 && (
              <div className="space-y-2">
                {formData.labResults.map((lab, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{lab.testName}</span>: {lab.value} {lab.unit}
                      {lab.referenceRange && (
                        <span className="text-gray-600 text-sm ml-2">
                          (Ref: {lab.referenceRange})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLabResult(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Symptoms */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Symptoms</h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSymptom}
                  onChange={(e) => setCurrentSymptom(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSymptom())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter symptom"
                />
                <button
                  type="button"
                  onClick={handleAddSymptom}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
            {formData.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {symptom}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          symptoms: formData.symptoms.filter((_, i) => i !== index),
                        })
                      }
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Current Medications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current Medications</h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMedication}
                  onChange={(e) => setCurrentMedication(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddMedication())
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter medication"
                />
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
            {formData.medications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.medications.map((medication, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {medication}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          medications: formData.medications.filter((_, i) => i !== index),
                        })
                      }
                      className="hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Medical History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Medical History</h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentCondition}
                  onChange={(e) => setCurrentCondition(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddCondition())
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter past condition or diagnosis"
                />
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
            {formData.medicalHistory.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.medicalHistory.map((condition, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {condition}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          medicalHistory: formData.medicalHistory.filter((_, i) => i !== index),
                        })
                      }
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Allergies</h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentAllergy}
                  onChange={(e) => setCurrentAllergy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter allergy"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
            {formData.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          allergies: formData.allergies.filter((_, i) => i !== index),
                        })
                      }
                      className="hover:text-red-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any additional clinical notes or observations..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={analyzeMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {analyzeMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
              {analyzeMutation.isPending ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
