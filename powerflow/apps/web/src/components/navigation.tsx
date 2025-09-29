'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Zap, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/') return true
    return pathname === path
  }

  return (
    <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">PowerFlow</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/dashboard">
              <Button 
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                className={cn(isActive('/dashboard') && 'bg-blue-600 text-white hover:bg-blue-700')}
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/simulations">
              <Button 
                variant={isActive('/simulations') ? 'default' : 'ghost'}
                className={cn(isActive('/simulations') && 'bg-blue-600 text-white hover:bg-blue-700')}
              >
                Simulations
              </Button>
            </Link>
            <Link href="/hardware">
              <Button 
                variant={isActive('/hardware') ? 'default' : 'ghost'}
                className={cn(isActive('/hardware') && 'bg-blue-600 text-white hover:bg-blue-700')}
              >
                Hardware
              </Button>
            </Link>
            <Link href="/analytics">
              <Button 
                variant={isActive('/analytics') ? 'default' : 'ghost'}
                className={cn(isActive('/analytics') && 'bg-blue-600 text-white hover:bg-blue-700')}
              >
                Analytics
              </Button>
            </Link>
            <Link href="/sst">
              <Button 
                variant={isActive('/sst') ? 'default' : 'ghost'}
                className={cn(isActive('/sst') && 'bg-blue-600 text-white hover:bg-blue-700')}
              >
                SST
              </Button>
            </Link>
            <Link href="/billing">
              <Button 
                variant={isActive('/billing') ? 'default' : 'ghost'}
                className={cn(isActive('/billing') && 'bg-blue-600 text-white hover:bg-blue-700')}
              >
                Billing
              </Button>
            </Link>
            <Link href="/settings">
              <Button 
                variant={isActive('/settings') ? 'outline' : 'outline'}
                className={cn(isActive('/settings') && 'bg-blue-600 text-white hover:bg-blue-700')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <a href="http://localhost:8080/" target="_self" rel="noopener">
              <Button variant="outline">
                ← Back to M.Y
              </Button>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}