'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Brain, Loader2, Play, AlertTriangle, CheckCircle, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import DicomViewer from '@/components/DicomViewer'
import { imagesApi, inferenceApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface ViewerPageProps {
  params: {
    id: string
  }
}

export default function ViewerPage({ params }: ViewerPageProps) {
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [gradCamMethod, setGradCamMethod] = useState('gradcam')
  const [showGradCam, setShowGradCam] = useState(true)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)

  // Fetch image metadata
  const { data: imageData, isLoading: imageLoading } = useQuery({
    queryKey: ['image', params.id],
    queryFn: () => imagesApi.getById(params.id),
  })

  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: () => inferenceApi.listModels(),
  })

  // Fetch inference results
  const {
    data: inferenceResults,
    isLoading: inferenceLoading,
    refetch: refetchInference,
  } = useQuery({
    queryKey: ['inference-results', params.id],
    queryFn: () => inferenceApi.getByImage(params.id),
    enabled: !!params.id,
  })

  // Download DICOM image
  useEffect(() => {
    async function downloadImage() {
      try {
        const response = await imagesApi.download(params.id)
        setImageBlob(response.data)
      } catch (error) {
        console.error('Failed to download image:', error)
        toast.error('Failed to load DICOM image')
      }
    }

    if (params.id) {
      downloadImage()
    }
  }, [params.id])

  // Auto-select model based on modality
  useEffect(() => {
    if (imageData?.data?.modality && modelsData?.data?.models) {
      const modality = imageData.data.modality
      const compatibleModel = modelsData.data.models.find(
        (m: any) => m.modality === modality
      )
      if (compatibleModel && !selectedModel) {
        setSelectedModel(compatibleModel.name)
      }
    }
  }, [imageData, modelsData, selectedModel])

  // Run inference mutation
  const analyzeMutation = useMutation({
    mutationFn: () =>
      inferenceApi.analyze(params.id, {
        model_name: selectedModel,
        generate_gradcam: true,
        gradcam_method: gradCamMethod,
      }),
    onSuccess: () => {
      toast.success('Analysis completed successfully!')
      refetchInference()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Analysis failed')
    },
  })

  const handleAnalyze = () => {
    if (!selectedModel) {
      toast.error('Please select a model')
      return
    }
    analyzeMutation.mutate()
  }

  const latestResult = inferenceResults?.data?.results?.[0]
  const gradCamOverlay = latestResult?.gradcam?.overlay_path
    ? `${process.env.NEXT_PUBLIC_API_URL}${latestResult.gradcam.overlay_path}`
    : undefined

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">Medical Imaging AI</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link href="/worklist" className="text-gray-700 hover:text-blue-600">
                Worklist
              </Link>
              <Link href="/upload" className="text-gray-700 hover:text-blue-600">
                Upload
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Viewer */}
        <div className="flex-1 bg-black">
          {imageLoading || !imageBlob ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-white">Loading DICOM image...</p>
              </div>
            </div>
          ) : (
            <DicomViewer
              imageBlob={imageBlob}
              showTools={true}
              enableGradCam={showGradCam && !!latestResult}
              gradCamOverlay={gradCamOverlay}
            />
          )}
        </div>

        {/* Right Panel - Controls & Results */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          {/* Back Button */}
          <div className="p-4 border-b">
            <Link
              href="/worklist"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Worklist
            </Link>
          </div>

          {/* Image Info */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Image Information</h2>
            {imageData?.data && (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Patient ID:</span>
                  <span className="ml-2 font-medium">{imageData.data.patient_id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Modality:</span>
                  <span className="ml-2 font-medium">{imageData.data.modality}</span>
                </div>
                <div>
                  <span className="text-gray-600">Body Part:</span>
                  <span className="ml-2 font-medium">{imageData.data.body_part || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="ml-2 font-medium">
                    {imageData.data.rows} × {imageData.data.columns}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      imageData.data.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {imageData.data.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Controls */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-3">AI Analysis</h2>

            {/* Model Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={analyzeMutation.isPending}
              >
                <option value="">Choose a model...</option>
                {modelsData?.data?.models?.map((model: any) => (
                  <option key={model.name} value={model.name}>
                    {model.description} ({model.modality})
                  </option>
                ))}
              </select>
            </div>

            {/* Grad-CAM Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grad-CAM Method
              </label>
              <select
                value={gradCamMethod}
                onChange={(e) => setGradCamMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={analyzeMutation.isPending}
              >
                <option value="gradcam">Grad-CAM</option>
                <option value="gradcam++">Grad-CAM++</option>
                <option value="scorecam">Score-CAM</option>
                <option value="xgradcam">XGrad-CAM</option>
              </select>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || !selectedModel}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Analysis
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {inferenceLoading ? (
            <div className="p-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading results...
              </div>
            </div>
          ) : latestResult ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Analysis Results</h2>
                {latestResult.gradcam && (
                  <button
                    onClick={() => setShowGradCam(!showGradCam)}
                    className={`text-sm px-3 py-1 rounded ${
                      showGradCam
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Grad-CAM {showGradCam ? 'ON' : 'OFF'}
                  </button>
                )}
              </div>

              {/* Prediction */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Prediction</div>
                <div className="text-xl font-bold text-blue-900">
                  {latestResult.predicted_class}
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-medium">
                      {(latestResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${latestResult.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Triage Priority */}
              <div className="mb-4 p-4 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Triage Priority</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      latestResult.triage_priority === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : latestResult.triage_priority === 'urgent'
                        ? 'bg-yellow-100 text-yellow-800'
                        : latestResult.triage_priority === 'routine'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {latestResult.triage_priority?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Clinical Findings */}
              {latestResult.findings && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Clinical Findings</h3>
                  <div className="space-y-2">
                    {latestResult.findings.abnormalities?.length > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Abnormalities:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {latestResult.findings.abnormalities.map(
                            (abnormality: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                              >
                                {abnormality}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {latestResult.findings.severity && (
                      <div className="text-sm">
                        <span className="text-gray-600">Severity:</span>
                        <span className="ml-2 font-medium">
                          {latestResult.findings.severity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {latestResult.findings?.recommendations?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Recommendations</h3>
                  <ul className="space-y-1 text-sm">
                    {latestResult.findings.recommendations.map(
                      (rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Attention Regions */}
              {latestResult.attention_regions?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">
                    High Attention Regions ({latestResult.attention_regions.length})
                  </h3>
                  <div className="space-y-2">
                    {latestResult.attention_regions.slice(0, 3).map((region: any, idx: number) => (
                      <div key={idx} className="text-xs p-2 bg-gray-50 rounded">
                        <div>
                          Position: ({region.x}, {region.y})
                        </div>
                        <div>
                          Size: {region.width} × {region.height}
                        </div>
                        <div>
                          Activation: {(region.activation * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>Model: {latestResult.model_name}</div>
                <div>
                  Inference Time: {latestResult.inference_time?.toFixed(2)}s
                </div>
                <div>
                  Created: {new Date(latestResult.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="text-center text-gray-500 py-8">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No analysis results yet</p>
                <p className="text-xs mt-1">Run analysis to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
