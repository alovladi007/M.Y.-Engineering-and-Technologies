'use client'

import Link from 'next/link'
import { Activity, Upload, Image, Brain, FileText, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">Medical Imaging AI</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/worklist" className="text-gray-700 hover:text-blue-600">
                Worklist
              </Link>
              <Link href="/upload" className="text-gray-700 hover:text-blue-600">
                Upload
              </Link>
              <Link href="/patients" className="text-gray-700 hover:text-blue-600">
                Patients
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Medical Imaging Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced DICOM analysis with explainable AI (Grad-CAM), automatic triage, and seamless
            PACS integration. Empowering radiologists with intelligent insights.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/upload"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload DICOM
            </Link>
            <Link
              href="/worklist"
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              View Worklist
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">DICOM Viewer</h3>
            <p className="text-gray-600">
              Full-featured DICOM viewer with window/level adjustment, pan, zoom, rotate, and
              multi-format support.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Grad-CAM Explainability</h3>
            <p className="text-gray-600">
              Visualize AI decision-making with Grad-CAM heatmaps. See exactly which regions
              influenced the prediction.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Automatic Triage</h3>
            <p className="text-gray-600">
              AI-powered priority assignment (critical, urgent, routine) based on findings and
              confidence levels.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Model Support</h3>
            <p className="text-gray-600">
              ResNet50, EfficientNet, DenseNet models for chest X-ray, CT, and MRI analysis across
              14+ pathologies.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Clinical Findings</h3>
            <p className="text-gray-600">
              Automatic generation of structured findings, severity assessment, and follow-up
              recommendations.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">PACS Integration</h3>
            <p className="text-gray-600">
              Seamless integration with Orthanc PACS for query, retrieve, and store operations
              (DICOM C-FIND/C-MOVE).
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Platform Statistics</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">14+</div>
              <div className="text-gray-600">Pathologies Detected</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">95.8%</div>
              <div className="text-gray-600">Average Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">3</div>
              <div className="text-gray-600">Imaging Modalities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">&lt;2s</div>
              <div className="text-gray-600">Inference Time</div>
            </div>
          </div>
        </div>

        {/* Supported Models */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Supported Models</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">ResNet50 - Chest X-Ray</h3>
              <p className="text-gray-600 text-sm mb-2">
                14-class pathology detection including pneumonia, cardiomegaly, effusion, mass, and
                nodule.
              </p>
              <div className="text-xs text-gray-500">Modality: X-Ray | Input: 512x512</div>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">EfficientNet-B0 - CT Scan</h3>
              <p className="text-gray-600 text-sm mb-2">
                COVID-19 detection from chest CT scans with high sensitivity and specificity.
              </p>
              <div className="text-xs text-gray-500">Modality: CT | Input: 512x512</div>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">DenseNet121 - Brain MRI</h3>
              <p className="text-gray-600 text-sm mb-2">
                Brain tumor classification: glioma, meningioma, pituitary, and normal.
              </p>
              <div className="text-xs text-gray-500">Modality: MRI | Input: 512x512</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p>Medical Imaging AI Platform - Built with Next.js, CornerstoneJS, and PyTorch</p>
            <p className="text-sm mt-2">M.Y. Engineering and Technologies</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
