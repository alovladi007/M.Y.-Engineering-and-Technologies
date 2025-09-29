'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/navigation'

export function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Don't show navigation on login page or admin pages
  const showUserNavigation = !pathname.startsWith('/admin') && pathname !== '/login'
  
  if (!showUserNavigation) {
    return (
      <div className="min-h-screen">
        {/* No navigation for login/admin pages */}
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
    </div>
  )
}