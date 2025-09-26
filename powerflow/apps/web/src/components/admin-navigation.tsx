'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Shield, Users, Building2, CreditCard, Activity, Settings, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && pathname === '/admin') return true
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-xl font-bold">PowerFlow Admin</h1>
                <p className="text-sm text-muted-foreground">Platform Management Console</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Button>
            </Link>
          </div>
        </div>
        
        <nav className="flex items-center space-x-6 mt-4 border-t pt-4">
          <Link href="/admin/dashboard">
            <Button 
              variant={isActive('/admin/dashboard') ? 'default' : 'ghost'}
              className={cn(isActive('/admin/dashboard') && 'bg-red-600 text-white hover:bg-red-700')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button 
              variant={isActive('/admin/users') ? 'default' : 'ghost'}
              className={cn(isActive('/admin/users') && 'bg-red-600 text-white hover:bg-red-700')}
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>
          </Link>
          <Link href="/admin/organizations">
            <Button 
              variant={isActive('/admin/organizations') ? 'default' : 'ghost'}
              className={cn(isActive('/admin/organizations') && 'bg-red-600 text-white hover:bg-red-700')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Organizations
            </Button>
          </Link>
          <Link href="/admin/billing">
            <Button 
              variant={isActive('/admin/billing') ? 'default' : 'ghost'}
              className={cn(isActive('/admin/billing') && 'bg-red-600 text-white hover:bg-red-700')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </Button>
          </Link>
          <Link href="/admin/system">
            <Button 
              variant={isActive('/admin/system') ? 'default' : 'ghost'}
              className={cn(isActive('/admin/system') && 'bg-red-600 text-white hover:bg-red-700')}
            >
              <Activity className="h-4 w-4 mr-2" />
              System
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button 
              variant={isActive('/admin/settings') ? 'default' : 'ghost'}
              className={cn(isActive('/admin/settings') && 'bg-red-600 text-white hover:bg-red-700')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}