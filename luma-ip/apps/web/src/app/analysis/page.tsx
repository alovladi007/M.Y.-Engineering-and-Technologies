import Link from 'next/link'
import { Search, BarChart3, FileText, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export default function Analysis() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="border-b bg-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
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
              <Link href="/filing" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                Filing
              </Link>
              <Link href="/analysis" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
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
          <h1 className="text-3xl font-bold mb-2">IP Analysis</h1>
          <p className="text-gray-400">Advanced patent analysis, prior art search, and competitive intelligence.</p>
        </div>

        {/* Search Interface */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-6">Prior Art Search</h2>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <input 
                type="text" 
                placeholder="Enter keywords, patent numbers, or technology descriptions..."
                className="flex-1 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select className="bg-white/10 rounded-lg px-3 py-2 text-sm">
                <option>All Categories</option>
                <option>Photonics & Optics</option>
                <option>Electronics</option>
                <option>Software</option>
                <option>Biomedical</option>
              </select>
              <select className="bg-white/10 rounded-lg px-3 py-2 text-sm">
                <option>All Status</option>
                <option>Granted</option>
                <option>Pending</option>
                <option>Expired</option>
              </select>
              <select className="bg-white/10 rounded-lg px-3 py-2 text-sm">
                <option>Date Range</option>
                <option>Last Year</option>
                <option>Last 5 Years</option>
                <option>Last 10 Years</option>
              </select>
              <select className="bg-white/10 rounded-lg px-3 py-2 text-sm">
                <option>Sort By</option>
                <option>Relevance</option>
                <option>Date (Newest)</option>
                <option>Citations</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analysis Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart3 className="h-6 w-6 text-blue-400 mr-2" />
              Patentability Analysis
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Novelty Score</span>
                  <span className="text-sm font-medium text-green-400">85/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Non-obviousness</span>
                  <span className="text-sm font-medium text-yellow-400">72/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full" style={{width: '72%'}}></div>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Utility</span>
                  <span className="text-sm font-medium text-green-400">95/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 text-purple-400 mr-2" />
              Competitive Landscape
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-bold">TC</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">TechCorp Inc.</p>
                    <p className="text-xs text-gray-400">47 patents</p>
                  </div>
                </div>
                <span className="text-xs text-red-400">High Risk</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-bold">IP</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Innovation Partners</p>
                    <p className="text-xs text-gray-400">23 patents</p>
                  </div>
                </div>
                <span className="text-xs text-yellow-400">Medium Risk</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-bold">QP</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Quantum Photonics</p>
                    <p className="text-xs text-gray-400">15 patents</p>
                  </div>
                </div>
                <span className="text-xs text-green-400">Low Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Search Results</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold">US10,123,456B2</h4>
                  <p className="text-sm text-gray-400">Quantum-Enhanced Photonic Computing System</p>
                  <p className="text-xs text-gray-500">Filed: Jan 15, 2023 | Granted: Aug 20, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">92% Match</span>
                <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">US10,987,654B1</h4>
                  <p className="text-sm text-gray-400">Optical Neural Network Architecture</p>
                  <p className="text-xs text-gray-500">Filed: Mar 22, 2023 | Granted: Sep 15, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">87% Match</span>
                <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold">EP3,456,789A1</h4>
                  <p className="text-sm text-gray-400">Photonic Integrated Circuit for AI Processing</p>
                  <p className="text-xs text-gray-500">Filed: Jun 10, 2023 | Pending</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">78% Match</span>
                <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
