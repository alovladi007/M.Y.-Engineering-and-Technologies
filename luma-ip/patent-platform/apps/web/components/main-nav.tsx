'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="text-2xl">⚖️</span>
        <span className="font-bold text-xl">LUMA IP</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/dashboard' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          Dashboard
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Filing</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/filing/new"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          New Patent Filing
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Start a new patent application with AI assistance
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/filing/drafts" title="Drafts">
                    View and manage your draft applications
                  </ListItem>
                  <ListItem href="/filing/submitted" title="Submitted">
                    Track submitted patent applications
                  </ListItem>
                  <ListItem href="/filing/templates" title="Templates">
                    Use pre-configured filing templates
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Portfolio</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/portfolio/patents" title="Patents">
                    Manage your granted patents
                  </ListItem>
                  <ListItem href="/portfolio/applications" title="Applications">
                    Track pending applications
                  </ListItem>
                  <ListItem href="/portfolio/prior-art" title="Prior Art">
                    Search and manage prior art
                  </ListItem>
                  <ListItem href="/portfolio/analytics" title="Analytics">
                    Portfolio insights and valuation
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/tools/claims-generator" title="Claims Generator">
                    AI-powered patent claims drafting
                  </ListItem>
                  <ListItem href="/tools/specification" title="Specification Writer">
                    Generate patent specifications
                  </ListItem>
                  <ListItem href="/tools/forms" title="USPTO Forms">
                    Generate and manage USPTO forms
                  </ListItem>
                  <ListItem href="/tools/docket" title="Docket Management">
                    Track deadlines and tasks
                  </ListItem>
                  <ListItem href="/tools/search" title="Prior Art Search">
                    Advanced prior art searching
                  </ListItem>
                  <ListItem href="/tools/analysis" title="Patentability Analysis">
                    Analyze patentability score
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Link
          href="/matters"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/matters' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          Matters
        </Link>
        <Link
          href="/team"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/team' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          Team
        </Link>
      </nav>
    </div>
  )
}

const ListItem = ({ className, title, children, href, ...props }: any) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href={href}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}