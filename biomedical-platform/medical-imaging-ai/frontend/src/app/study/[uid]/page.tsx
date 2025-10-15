'use client'

import { useQuery } from '@tanstack/react-query'
import { Brain, ArrowLeft, Loader2, AlertCircle, Eye, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { studiesApi } from '@/lib/api'

interface StudyPageProps {
  params: {
    uid: string
  }
}

export default function StudyPage({ params }: StudyPageProps) {
  // Fetch study details
  const { data: studyData, isLoading: studyLoading } = useQuery({
    queryKey: ['study', params.uid],
    queryFn: () => studiesApi.getById(params.uid),
  })

  // Fetch study images
  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['study-images', params.uid],
    queryFn: () => studiesApi.getImages(params.uid),
  })

  const study = studyData?.data
  const images = imagesData?.data?.images || []

  const isLoading = studyLoading || imagesLoading

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/worklist"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Worklist
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading study...</p>
          </div>
        ) : !study ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">Study Not Found</p>
            <p className="text-gray-600">The requested study could not be found.</p>
          </div>
        ) : (
          <>
            {/* Study Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Study Details</h1>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Patient Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Patient ID:</span>
                      <span className="ml-2 text-sm font-medium">{study.patient_id}</span>
                    </div>
                    {study.patient_age && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 ml-6">Age:</span>
                        <span className="ml-2 text-sm font-medium">{study.patient_age} years</span>
                      </div>
                    )}
                    {study.patient_sex && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 ml-6">Sex:</span>
                        <span className="ml-2 text-sm font-medium">{study.patient_sex}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Study Information</h3>
                  <div className="space-y-2">
                    {study.study_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="ml-2 text-sm font-medium">
                          {new Date(study.study_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {study.study_description && (
                      <div className="flex items-start">
                        <span className="text-sm text-gray-600 ml-6">Description:</span>
                        <span className="ml-2 text-sm font-medium">{study.study_description}</span>
                      </div>
                    )}
                    {study.accession_number && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 ml-6">Accession:</span>
                        <span className="ml-2 text-sm font-medium">{study.accession_number}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 ml-6">Priority:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          study.priority === 'stat'
                            ? 'bg-red-100 text-red-800'
                            : study.priority === 'urgent'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {study.priority?.toUpperCase() || 'ROUTINE'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 ml-6">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          study.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : study.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {study.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-gray-500">
                  Study Instance UID: {study.study_instance_uid}
                </div>
              </div>
            </div>

            {/* Images Grid */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Images ({images.length})
                </h2>
              </div>

              {images.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No images found in this study</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {images.map((image: any) => (
                    <Link
                      key={image.id}
                      href={`/viewer/${image.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition group"
                    >
                      <div className="aspect-square bg-black rounded-md mb-3 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Eye className="w-8 h-8 mx-auto mb-2 group-hover:text-blue-400" />
                          <div className="text-xs text-gray-400">
                            {image.modality}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          Series: {image.series_instance_uid?.slice(-8)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {image.rows} × {image.columns}
                        </div>
                        {image.body_part && (
                          <div className="text-xs text-gray-600">{image.body_part}</div>
                        )}
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs ${
                              image.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : image.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {image.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
