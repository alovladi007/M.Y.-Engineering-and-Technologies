'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  FileText, 
  Search, 
  Calendar, 
  Users, 
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Drafting',
      description: 'Generate patent claims and specifications using advanced LLM technology trained on millions of patents',
      badge: 'GPT-4 Powered'
    },
    {
      icon: FileText,
      title: 'USPTO Form Generation',
      description: 'Automatically create ADS, IDS, and other USPTO forms with validated data and proper formatting',
      badge: 'Auto-Fill'
    },
    {
      icon: Search,
      title: 'Prior Art Search',
      description: 'Vector-based semantic search through global patent databases with relevance scoring',
      badge: 'Real-time'
    },
    {
      icon: Calendar,
      title: 'Docket Management',
      description: 'Never miss a deadline with automated tracking of office actions, maintenance fees, and priority dates',
      badge: 'Automated'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with role-based access control, comments, and real-time updates',
      badge: 'Multi-user'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, SOC 2 compliance, and comprehensive audit trails',
      badge: 'Secure'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Patents Filed' },
    { value: '87%', label: 'Grant Rate' },
    { value: '60%', label: 'Time Saved' },
    { value: '500+', label: 'Law Firms' }
  ]

  const workflow = [
    { step: '01', title: 'Describe Invention', description: 'Input your invention details and technical specifications' },
    { step: '02', title: 'AI Generation', description: 'Our LLM generates claims, specifications, and drawings' },
    { step: '03', title: 'Prior Art Analysis', description: 'Automatic search and patentability scoring' },
    { step: '04', title: 'Review & Edit', description: 'Refine the generated documents with AI assistance' },
    { step: '05', title: 'File with USPTO', description: 'Submit directly or export for traditional filing' }
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.purple.100),white)] opacity-20" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-purple-600/10 ring-1 ring-purple-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
        
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-4" variant="secondary">
              <Zap className="mr-1 h-3 w-3" />
              AI-Powered Patent Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              LUMA IP
            </h1>
            <p className="mt-2 text-2xl text-purple-600 font-semibold">
              Legal Utility for Machine Assisted IP Analysis
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Transform your patent filing process with advanced AI. Generate complete patent applications 
              in minutes, not months. Powered by state-of-the-art language models trained on millions of patents.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-purple-600 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-purple-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for patent filing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              A complete platform that handles the entire patent lifecycle from ideation to grant
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple 5-Step Process
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From idea to filed patent in record time
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="space-y-8">
              {workflow.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-gray-600">{item.description}</p>
                  </div>
                  {idx < workflow.length - 1 && (
                    <div className="absolute ml-5 mt-10 h-8 w-0.5 bg-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to revolutionize your patent practice?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-purple-100">
              Join thousands of patent professionals using LUMA IP to file patents faster and more accurately than ever before.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="ghost" className="text-white hover:text-purple-100">
                  Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚖️</span>
              <span className="font-bold text-xl text-white">LUMA IP</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 LUMA IP. All rights reserved. Patent pending.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white">
                Terms
              </Link>
              <Link href="/docs" className="text-sm text-gray-400 hover:text-white">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}