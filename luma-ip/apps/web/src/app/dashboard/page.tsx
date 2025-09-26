import Link from 'next/link'
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, DollarSign, Globe } from 'lucide-react'

export default function Dashboard() {
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
              <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Dashboard
              </Link>
              <Link href="/filing" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's an overview of your IP portfolio and recent activity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm text-gray-400">Pending Applications</p>
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
                <p className="text-sm text-gray-400">Granted Patents</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8 this month
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Portfolio Value</p>
                <p className="text-2xl font-bold">$2.4M</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              +15% YoY
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/filing" className="flex items-center p-3 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 transition-colors">
                <FileText className="h-5 w-5 text-blue-400 mr-3" />
                <span>Start New Application</span>
              </Link>
              <Link href="/analysis" className="flex items-center p-3 bg-purple-600/20 rounded-lg hover:bg-purple-600/30 transition-colors">
                <TrendingUp className="h-5 w-5 text-purple-400 mr-3" />
                <span>Run Prior Art Search</span>
              </Link>
              <Link href="/portfolio" className="flex items-center p-3 bg-green-600/20 rounded-lg hover:bg-green-600/30 transition-colors">
                <Globe className="h-5 w-5 text-green-400 mr-3" />
                <span>View Portfolio Analytics</span>
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium">US Patent #11,234,567</p>
                    <p className="text-xs text-gray-400">Granted - Quantum Photonic Processor</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Office Action Response</p>
                    <p className="text-xs text-gray-400">Due in 14 days</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">1 week ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium">New Application Filed</p>
                    <p className="text-xs text-gray-400">AI-Enhanced FPGA Routing</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">1 week ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Distribution */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Technology Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💡</span>
              </div>
              <h4 className="font-semibold mb-2">Photonics & Optics</h4>
              <p className="text-2xl font-bold text-blue-400 mb-1">47</p>
              <p className="text-sm text-gray-400">patents</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔧</span>
              </div>
              <h4 className="font-semibold mb-2">FPGA & Computing</h4>
              <p className="text-2xl font-bold text-purple-400 mb-1">35</p>
              <p className="text-sm text-gray-400">patents</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🧬</span>
              </div>
              <h4 className="font-semibold mb-2">Biomedical Tech</h4>
              <p className="text-2xl font-bold text-green-400 mb-1">45</p>
              <p className="text-sm text-gray-400">patents</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
