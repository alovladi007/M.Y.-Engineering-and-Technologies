'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Zap, Eye, EyeOff, Shield } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Mock user database with roles
  const mockUsers = [
    { email: 'admin@powerflow.dev', password: 'admin123', role: 'admin', name: 'System Administrator' },
    { email: 'sarah.chen@tesla.com', password: 'user123', role: 'user', name: 'Sarah Chen' },
    { email: 'mike@byd.com', password: 'user123', role: 'user', name: 'Michael Rodriguez' },
    { email: 'lisa@vw.de', password: 'user123', role: 'user', name: 'Lisa Wagner' }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const user = mockUsers.find(u => u.email === email && u.password === password)
    
    if (user) {
      // Store user info (in a real app, use proper authentication)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Route based on role
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } else {
      alert('Invalid email or password')
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (userType: 'admin' | 'user') => {
    if (userType === 'admin') {
      setEmail('admin@powerflow.dev')
      setPassword('admin123')
    } else {
      setEmail('sarah.chen@tesla.com')
      setPassword('user123')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PowerFlow</h1>
          <p className="text-gray-600">Power Electronics Engineering Platform</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="mt-1 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-4">Demo Accounts:</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleDemoLogin('user')}
                  className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">U</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">Engineer Account</div>
                      <div className="text-xs text-gray-500">sarah.chen@tesla.com</div>
                    </div>
                  </div>
                  <Badge variant="outline">User</Badge>
                </button>

                <button
                  onClick={() => handleDemoLogin('admin')}
                  className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">Admin Account</div>
                      <div className="text-xs text-gray-500">admin@powerflow.dev</div>
                    </div>
                  </div>
                  <Badge variant="destructive">Admin</Badge>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}