'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, FileImage, Brain, Loader2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { imagesApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface UploadedFile {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  imageId?: string
  error?: string
  progress: number
}

export default function UploadPage() {
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    // Add files to upload queue
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Upload files sequentially
    setIsUploading(true)

    for (let i = 0; i < newFiles.length; i++) {
      const fileIndex = uploadedFiles.length + i

      // Update status to uploading
      setUploadedFiles((prev) =>
        prev.map((f, idx) => (idx === fileIndex ? { ...f, status: 'uploading' as const } : f))
      )

      try {
        const response = await imagesApi.upload(newFiles[i].file)

        // Update status to success
        setUploadedFiles((prev) =>
          prev.map((f, idx) =>
            idx === fileIndex
              ? {
                  ...f,
                  status: 'success' as const,
                  imageId: response.data.id,
                  progress: 100,
                }
              : f
          )
        )

        toast.success(`${newFiles[i].file.name} uploaded successfully`)
      } catch (error: any) {
        // Update status to error
        setUploadedFiles((prev) =>
          prev.map((f, idx) =>
            idx === fileIndex
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error.response?.data?.detail || 'Upload failed',
                }
              : f
          )
        )

        toast.error(`Failed to upload ${newFiles[i].file.name}`)
      }
    }

    setIsUploading(false)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/dicom': ['.dcm', '.DCM', '.dicom'],
    },
    multiple: true,
  })

  const handleAnalyze = (imageId: string) => {
    router.push(`/viewer/${imageId}`)
  }

  const handleRemove = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== index))
  }

  const successCount = uploadedFiles.filter((f) => f.status === 'success').length
  const errorCount = uploadedFiles.filter((f) => f.status === 'error').length

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
              <Link href="/upload" className="text-blue-600 font-medium">
                Upload
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Upload DICOM Images</h1>
          <p className="text-gray-600 mt-2">
            Drag and drop DICOM files or click to browse. Supports .dcm files.
          </p>
        </div>

        {/* Upload Summary */}
        {uploadedFiles.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Files</div>
              <div className="text-2xl font-bold">{uploadedFiles.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Uploaded</div>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Failed</div>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            </div>
          </div>
        )}

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-lg text-blue-600">Drop DICOM files here...</p>
          ) : (
            <>
              <p className="text-lg text-gray-700 mb-2">
                Drag and drop DICOM files here, or click to select
              </p>
              <p className="text-sm text-gray-500">Supports .dcm, .DCM, .dicom files</p>
            </>
          )}
        </div>

        {/* Upload List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
            <div className="bg-white rounded-lg shadow divide-y">
              {uploadedFiles.map((uploadedFile, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <FileImage className="w-8 h-8 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{uploadedFile.file.name}</div>
                      <div className="text-sm text-gray-500">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      {uploadedFile.error && (
                        <div className="text-sm text-red-600 mt-1">{uploadedFile.error}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {uploadedFile.status === 'pending' && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        Pending
                      </span>
                    )}

                    {uploadedFile.status === 'uploading' && (
                      <span className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </span>
                    )}

                    {uploadedFile.status === 'success' && (
                      <>
                        <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Success
                        </span>
                        <button
                          onClick={() => handleAnalyze(uploadedFile.imageId!)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Analyze
                        </button>
                      </>
                    )}

                    {uploadedFile.status === 'error' && (
                      <span className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">
                        <XCircle className="w-4 h-4" />
                        Failed
                      </span>
                    )}

                    {!isUploading && (
                      <button
                        onClick={() => handleRemove(index)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {successCount > 0 && !isUploading && (
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => setUploadedFiles([])}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Clear All
            </button>
            <Link
              href="/worklist"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              View Worklist
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
