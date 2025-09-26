import Link from 'next/link'
import { FileText, Search, BarChart3, Shield, Zap, Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="border-b bg-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
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

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LUMA IP
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Legal Utility for Machine Assisted IP Analysis
          </p>
          <p className="text-lg text-gray-400 max-w-4xl mx-auto mb-12">
            Advanced patent filing platform with AI-powered analysis, automated filing capabilities, 
            and comprehensive IP portfolio management for modern innovators.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity">
              Get Started
            </Link>
            <Link href="/analysis" className="px-8 py-4 bg-white/10 rounded-lg font-semibold text-white hover:bg-white/20 transition-colors">
              View Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="card">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-blue-400 mr-3" />
              <h3 className="text-xl font-semibold">Automated Filing</h3>
            </div>
            <p className="text-gray-400">
              Streamline patent applications with AI-powered drafting, automated USPTO filing, and real-time status tracking.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Search className="h-8 w-8 text-purple-400 mr-3" />
              <h3 className="text-xl font-semibold">Prior Art Analysis</h3>
            </div>
            <p className="text-gray-400">
              Comprehensive prior art search with machine learning algorithms to identify relevant patents and assess patentability.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-8 w-8 text-green-400 mr-3" />
              <h3 className="text-xl font-semibold">Portfolio Analytics</h3>
            </div>
            <p className="text-gray-400">
              Advanced analytics and insights for IP portfolio management, competitive intelligence, and strategic decision making.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Zap className="h-8 w-8 text-yellow-400 mr-3" />
              <h3 className="text-xl font-semibold">AI-Powered Drafting</h3>
            </div>
            <p className="text-gray-400">
              Intelligent patent drafting with natural language processing, claim optimization, and technical writing assistance.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-red-400 mr-3" />
              <h3 className="text-xl font-semibold">Security & Compliance</h3>
            </div>
            <p className="text-gray-400">
              Enterprise-grade security with SOC 2 compliance, encrypted data storage, and audit trails for all activities.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-cyan-400 mr-3" />
              <h3 className="text-xl font-semibold">Global Filing</h3>
            </div>
            <p className="text-gray-400">
              Multi-jurisdictional filing support with automated translation, local patent office integration, and deadline management.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold text-center mb-8">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">10,000+</div>
              <div className="text-gray-400">Patents Filed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">95%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">500+</div>
              <div className="text-gray-400">Active Clients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">50+</div>
              <div className="text-gray-400">Countries</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
