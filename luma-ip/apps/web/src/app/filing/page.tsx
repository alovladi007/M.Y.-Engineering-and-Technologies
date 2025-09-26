import Link from 'next/link'
import { FileText, Plus, Upload, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export default function Filing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="border-b bg-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">LUMA IP</h1>
                <p className="text-sm text-gray-400">Legal Utility for Machine Assisted IP Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                Dashboard
              </Link>
              <Link href="/filing" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Filing
              </Link>
              <Link href="/analysis" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                Analysis
              </Link>
              <Link href="/portfolio" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                Portfolio
              </Link>
              <a href="http://localhost:8081/index.html" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                ← Back to M.Y
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Patent Filing</h1>
          <p className="text-gray-400">Create, manage, and file patent applications with AI assistance.</p>
        </div>

        {/* Quick Start */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="p-6 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 transition-colors text-left">
              <Plus className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold mb-2">New Application</h3>
              <p className="text-gray-400 text-sm">Start a new patent application with AI-powered drafting assistance.</p>
            </button>
            <button className="p-6 bg-purple-600/20 rounded-lg hover:bg-purple-600/30 transition-colors text-left">
              <Upload className="h-8 w-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Upload Draft</h3>
              <p className="text-gray-400 text-sm">Upload an existing draft for review and optimization.</p>
            </button>
            <button className="p-6 bg-green-600/20 rounded-lg hover:bg-green-600/30 transition-colors text-left">
              <CheckCircle className="h-8 w-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Template Library</h3>
              <p className="text-gray-400 text-sm">Browse our library of patent application templates.</p>
            </button>
          </div>
        </div>

        {/* Active Applications */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-6">Active Applications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Quantum Photonic Processor Architecture</h3>
                  <p className="text-sm text-gray-400">US Application #17/123,456 • Filed: Oct 15, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">Under Review</span>
                <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Continue
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">AI-Enhanced FPGA Routing Algorithm</h3>
                  <p className="text-sm text-gray-400">US Application #17/234,567 • Filed: Nov 2, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">Office Action</span>
                <button className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                  Respond
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Non-Invasive Glucose Monitoring Biosensor</h3>
                  <p className="text-sm text-gray-400">US Application #17/345,678 • Filed: Nov 10, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Drafting</span>
                <button className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filing Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Applications Filed</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <span>+5 this month</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="flex items-center text-sm text-yellow-400">
              <span>3 require attention</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <span>Above industry average</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
