import { useState } from 'react'
import { auth } from '../lib/api'
import { useAuthStore } from '../lib/store'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { data } = await auth.getGoogleAuthUrl()
      window.location.href = data.auth_url
    } catch (error) {
      console.error('Login failed:', error)
      setLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    setLoading(true)
    try {
      const { data } = await auth.getGitHubAuthUrl()
      window.location.href = data.auth_url
    } catch (error) {
      console.error('Login failed:', error)
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    // Demo user data
    const demoUser = {
      id: 1,
      email: 'vladimir@myengineering.tech',
      name: 'Vladimir Antoine',
      role: 'admin',
      orgs: [
        {
          id: 1,
          name: 'M.Y. Engineering & Technologies',
          role: 'admin'
        }
      ]
    }

    const demoToken = 'demo-token-for-development'

    // Set auth state
    setAuth(demoUser, demoToken)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-600 to-blue-500 rounded-xl items-center justify-center mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent mb-2">
              Power Platform
            </h1>
            <p className="text-gray-600">Cloud-Native Power Electronics Simulation</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-800 rounded-lg shadow-sm bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or for demo purposes</span>
              </div>
            </div>

            <button
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center px-4 py-3 border-2 border-primary-500 rounded-lg shadow-sm bg-white text-sm font-medium text-primary-600 hover:bg-primary-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Try Demo (No Login Required)
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            A division of M.Y. Engineering and Technologies
          </p>
        </div>
      </div>
    </div>
  )
}
