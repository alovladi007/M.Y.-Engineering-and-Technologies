'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FileText,
  Brain,
  Search,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

interface FilingData {
  title: string
  field: string
  type: string
  description: string
  problem: string
  solution: string
  advantages: string
  technicalDetails: string
  inventors: Array<{
    name: string
    email: string
    address: string
    citizenship: string
  }>
  applicant: {
    name: string
    type: string
    address: string
    country: string
  }
  claims: any
  specification: any
  priorArt: any[]
  patentabilityScore: number
}

export default function NewFilingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [filingData, setFilingData] = useState<FilingData>({
    title: '',
    field: '',
    type: 'utility',
    description: '',
    problem: '',
    solution: '',
    advantages: '',
    technicalDetails: '',
    inventors: [{ name: '', email: '', address: '', citizenship: 'US' }],
    applicant: { name: '', type: 'corporation', address: '', country: 'US' },
    claims: null,
    specification: null,
    priorArt: [],
    patentabilityScore: 0
  })

  const steps = [
    { id: 1, title: 'Basic Information', icon: FileText },
    { id: 2, title: 'Technical Details', icon: Brain },
    { id: 3, title: 'Inventors & Applicant', icon: Users },
    { id: 4, title: 'AI Generation', icon: Brain },
    { id: 5, title: 'Prior Art Search', icon: Search },
    { id: 6, title: 'Review & Submit', icon: CheckCircle }
  ]

  const handleGenerateClaims = async () => {
    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      setFilingData({
        ...filingData,
        claims: {
          independent: [
            '1. A system for automated patent analysis comprising:\n   a processing unit configured to analyze invention disclosures;\n   an AI engine trained on patent data;\n   wherein the system generates patent documents automatically.',
            '10. A method for automated patent filing comprising:\n   receiving invention disclosure data;\n   processing the data using machine learning;\n   generating USPTO-compliant documents.'
          ],
          dependent: [
            '2. The system of claim 1, further comprising a neural network.',
            '3. The system of claim 1, wherein the AI engine uses transformer architecture.',
            '4. The system of claim 2, wherein the neural network is a large language model.'
          ]
        }
      })
      setIsGenerating(false)
    }, 2000)
  }

  const handleGenerateSpecification = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setFilingData({
        ...filingData,
        specification: {
          title: filingData.title.toUpperCase(),
          abstract: 'The present invention relates to an automated system for patent document generation...',
          background: 'Traditional patent filing methods are time-consuming and error-prone...',
          summary: 'The invention provides an AI-powered solution for automated patent drafting...',
          detailedDescription: 'Referring to Figure 1, the system 100 comprises...',
          claims: 'What is claimed is:...'
        }
      })
      setIsGenerating(false)
    }, 2000)
  }

  const handlePriorArtSearch = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setFilingData({
        ...filingData,
        priorArt: [
          { id: 'US10123456', title: 'Related Patent 1', relevance: 0.92, date: '2019-03-15' },
          { id: 'US09876543', title: 'Related Patent 2', relevance: 0.87, date: '2018-07-22' },
          { id: 'EP3123456', title: 'Related Patent 3', relevance: 0.83, date: '2020-01-10' }
        ],
        patentabilityScore: 85
      })
      setIsGenerating(false)
    }, 2000)
  }

  const progressPercentage = (currentStep / steps.length) * 100

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Patent Filing</h1>
        <p className="text-muted-foreground">
          AI-powered patent application drafting with LUMA IP
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  currentStep >= step.id ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs mt-2">{step.title}</span>
              </div>
            )
          })}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            Step {currentStep} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Invention Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title for your invention"
                  value={filingData.title}
                  onChange={(e) => setFilingData({ ...filingData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field">Technical Field</Label>
                  <Select
                    value={filingData.field}
                    onValueChange={(value) => setFilingData({ ...filingData, field: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">Software/AI</SelectItem>
                      <SelectItem value="biotech">Biotechnology</SelectItem>
                      <SelectItem value="mechanical">Mechanical</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="chemical">Chemical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Patent Type</Label>
                  <Select
                    value={filingData.type}
                    onValueChange={(value) => setFilingData({ ...filingData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utility">Utility</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="plant">Plant</SelectItem>
                      <SelectItem value="provisional">Provisional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Brief Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a brief overview of your invention"
                  rows={4}
                  value={filingData.description}
                  onChange={(e) => setFilingData({ ...filingData, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="problem">Problem Addressed</Label>
                <Textarea
                  id="problem"
                  placeholder="What problem does your invention solve?"
                  rows={3}
                  value={filingData.problem}
                  onChange={(e) => setFilingData({ ...filingData, problem: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="solution">Technical Solution</Label>
                <Textarea
                  id="solution"
                  placeholder="How does your invention solve this problem?"
                  rows={3}
                  value={filingData.solution}
                  onChange={(e) => setFilingData({ ...filingData, solution: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="advantages">Key Advantages</Label>
                <Textarea
                  id="advantages"
                  placeholder="List the main advantages and improvements"
                  rows={3}
                  value={filingData.advantages}
                  onChange={(e) => setFilingData({ ...filingData, advantages: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="technical">Technical Implementation Details</Label>
                <Textarea
                  id="technical"
                  placeholder="Describe the technical implementation"
                  rows={4}
                  value={filingData.technicalDetails}
                  onChange={(e) => setFilingData({ ...filingData, technicalDetails: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Inventor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inventor-name">Name</Label>
                    <Input
                      id="inventor-name"
                      placeholder="Full name"
                      value={filingData.inventors[0].name}
                      onChange={(e) => {
                        const newInventors = [...filingData.inventors]
                        newInventors[0].name = e.target.value
                        setFilingData({ ...filingData, inventors: newInventors })
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inventor-email">Email</Label>
                    <Input
                      id="inventor-email"
                      type="email"
                      placeholder="email@example.com"
                      value={filingData.inventors[0].email}
                      onChange={(e) => {
                        const newInventors = [...filingData.inventors]
                        newInventors[0].email = e.target.value
                        setFilingData({ ...filingData, inventors: newInventors })
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Applicant Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="applicant-name">Organization Name</Label>
                    <Input
                      id="applicant-name"
                      placeholder="Company name"
                      value={filingData.applicant.name}
                      onChange={(e) =>
                        setFilingData({
                          ...filingData,
                          applicant: { ...filingData.applicant, name: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="applicant-type">Entity Type</Label>
                    <Select
                      value={filingData.applicant.type}
                      onValueChange={(value) =>
                        setFilingData({
                          ...filingData,
                          applicant: { ...filingData.applicant, type: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="llc">LLC</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Use AI to generate patent documents based on your invention details
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generate Claims</CardTitle>
                    <CardDescription>
                      AI will create independent and dependent claims
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleGenerateClaims}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Claims'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generate Specification</CardTitle>
                    <CardDescription>
                      Create complete patent specification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleGenerateSpecification}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Specification'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {filingData.claims && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Claims</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Independent Claims</h4>
                        {filingData.claims.independent.map((claim: string, idx: number) => (
                          <p key={idx} className="text-sm mb-2 whitespace-pre-wrap">
                            {claim}
                          </p>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Dependent Claims</h4>
                        {filingData.claims.dependent.map((claim: string, idx: number) => (
                          <p key={idx} className="text-sm mb-2">
                            {claim}
                          </p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <Alert>
                <Search className="h-4 w-4" />
                <AlertDescription>
                  Search for prior art and analyze patentability
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Prior Art Search</CardTitle>
                  <CardDescription>
                    AI-powered search through patent databases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handlePriorArtSearch}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Search Prior Art'
                    )}
                  </Button>
                </CardContent>
              </Card>

              {filingData.priorArt.length > 0 && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Patentability Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        {filingData.patentabilityScore}%
                      </div>
                      <Progress value={filingData.patentabilityScore} className="mt-2" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Based on novelty, non-obviousness, and utility analysis
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Prior Art Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {filingData.priorArt.map((art: any) => (
                          <div key={art.id} className="flex justify-between items-center p-3 border rounded">
                            <div>
                              <p className="font-medium">{art.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {art.id} • {art.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {Math.round(art.relevance * 100)}%
                              </div>
                              <p className="text-xs text-muted-foreground">Relevance</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your patent application is ready for submission
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Application Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium">{filingData.title || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{filingData.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Field:</span>
                      <span className="font-medium">{filingData.field || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inventor:</span>
                      <span className="font-medium">{filingData.inventors[0].name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applicant:</span>
                      <span className="font-medium">{filingData.applicant.name || 'Not provided'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Patent Specification</span>
                      </div>
                      {filingData.specification ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Patent Claims</span>
                      </div>
                      {filingData.claims ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Prior Art Analysis</span>
                      </div>
                      {filingData.priorArt.length > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button size="lg" className="px-8">
                  Submit Patent Application
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
          disabled={currentStep === steps.length}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}