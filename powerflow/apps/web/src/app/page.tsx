import Link from 'next/link'
import { Zap, Cpu, Battery, Activity, ArrowRight, Github } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">PowerFlow</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/projects" className="text-white/80 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/docs" className="text-white/80 hover:text-white transition-colors">
                Docs
              </Link>
              <a 
                href="https://github.com/your-repo/powerflow" 
                target="_blank"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6">
            Design Power Electronics
            <span className="block bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              10x Faster
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            The only platform with native SST/DAB simulation, real-time ZVS optimization, 
            and integrated HIL testing.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/projects"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-xl hover:shadow-2xl"
            >
              Start New Project <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/demo"
              className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center text-white mb-12">Platform Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
            <Zap className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">SST/DAB Simulation</h3>
            <p className="text-gray-400">
              Industry-first native solid-state transformer and dual-active bridge modeling
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
            <Cpu className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">SiC/GaN Models</h3>
            <p className="text-gray-400">
              Accurate wide-bandgap semiconductor models validated with major vendors
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
            <Battery className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">HIL Testing</h3>
            <p className="text-gray-400">
              Seamless hardware-in-the-loop integration with safety interlocks
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
            <Activity className="h-12 w-12 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Real-time Analytics</h3>
            <p className="text-gray-400">
              Live ZVS mapping, efficiency optimization, and thermal analysis
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur border border-white/10 rounded-3xl p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-white mb-2">94.5%</div>
              <div className="text-gray-400">Average Efficiency</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">100kHz</div>
              <div className="text-gray-400">Switching Frequency</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">2.3%</div>
              <div className="text-gray-400">Total Harmonic Distortion</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">1.2kW</div>
              <div className="text-gray-400">Power Output</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Join leading power electronics engineers using PowerFlow to accelerate development.
        </p>
        <Link 
          href="/projects"
          className="inline-block px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-lg shadow-2xl"
        >
          Start Building Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20">
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          <p>© 2025 M.Y. Engineering and Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
