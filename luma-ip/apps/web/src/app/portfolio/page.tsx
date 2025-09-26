import Link from 'next/link'
import { BarChart3, Globe, TrendingUp, DollarSign, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="border-b bg-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
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
              <Link href="/analysis" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                Analysis
              </Link>
              <Link href="/portfolio" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
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
          <h1 className="text-3xl font-bold mb-2">Portfolio Analytics</h1>
          <p className="text-gray-400">Comprehensive view of your IP portfolio performance and strategic insights.</p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Total Patents</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12 this quarter
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Portfolio Value</p>
                <p className="text-2xl font-bold">$2.4M</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              +15% YoY
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Active Applications</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="flex items-center text-sm text-yellow-400">
              <AlertTriangle className="h-4 w-4 mr-1" />
              3 require attention
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              Above industry avg
            </div>
          </div>
        </div>

        {/* Technology Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h3 className="text-xl font-semibold mb-6">Technology Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="text-sm">Photonics & Optics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">47</span>
                  <span className="text-xs text-gray-400">(37%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                  <span className="text-sm">FPGA & Computing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">35</span>
                  <span className="text-xs text-gray-400">(28%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-sm">Biomedical Tech</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">45</span>
                  <span className="text-xs text-gray-400">(35%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-6">Geographic Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-blue-400 mr-3" />
                  <span className="text-sm">United States</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">89</span>
                  <span className="text-xs text-gray-400">(70%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-purple-400 mr-3" />
                  <span className="text-sm">European Union</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">23</span>
                  <span className="text-xs text-gray-400">(18%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-green-400 mr-3" />
                  <span className="text-sm">Asia Pacific</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">15</span>
                  <span className="text-xs text-gray-400">(12%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Patents */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold mb-6">Recent Patents</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold">US11,234,567B2</h4>
                  <p className="text-sm text-gray-400">Quantum Photonic Processor Architecture</p>
                  <p className="text-xs text-gray-500">Granted: March 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Granted</span>
                <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-semibold">US2024/123456A1</h4>
                  <p className="text-sm text-gray-400">AI-Enhanced FPGA Routing Algorithm</p>
                  <p className="text-xs text-gray-500">Filed: January 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">Pending</span>
                <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold">US11,234,568B2</h4>
                  <p className="text-sm text-gray-400">Non-Invasive Glucose Monitoring Biosensor</p>
                  <p className="text-xs text-gray-500">Granted: February 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Granted</span>
                <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Performance */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Portfolio Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">147</div>
              <div className="text-sm text-gray-400 mb-1">Total Citations</div>
              <div className="text-xs text-green-400">+23% YoY</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">8.2</div>
              <div className="text-sm text-gray-400 mb-1">Avg Citations/Patent</div>
              <div className="text-xs text-green-400">Above industry avg</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">$18.9K</div>
              <div className="text-sm text-gray-400 mb-1">Avg Patent Value</div>
              <div className="text-xs text-green-400">+12% YoY</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
