'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  organization?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          
          // Role-based routing
          const isAdminRoute = pathname.startsWith('/admin')
          const isUserRoute = !isAdminRoute && pathname !== '/login'
          
          if (parsedUser.role === 'admin' && isUserRoute) {
            // Admin trying to access user routes, redirect to admin
            router.push('/admin/dashboard')
            return
          }
          
          if (parsedUser.role === 'user' && isAdminRoute) {
            // User trying to access admin routes, redirect to user dashboard
            router.push('/dashboard')
            return
          }
        } else if (pathname !== '/login') {
          // Not logged in and not on login page, redirect to login
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (pathname !== '/login') {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    
    // Route based on role
    if (userData.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}