// ==================== Advanced Patent Filing Features ====================

// New Filing Component with Complete Workflow
function NewFiling() {
    const { aiService, setLoading } = useApp();
    const [currentStep, setCurrentStep] = useState(1);
    const [filingData, setFilingData] = useState({
        // Basic Information
        title: '',
        field: '',
        type: 'system',
        classification: '',
        
        // Technical Details
        description: '',
        problem: '',
        solution: '',
        advantages: '',
        components: [],
        
        // Inventors & Applicants
        inventors: [{ name: '', email: '', address: '', citizenship: '' }],
        applicant: { name: '', type: 'corporation', address: '', country: 'US' },
        
        // Generated Content
        claims: null,
        specification: null,
        drawings: [],
        priorArt: [],
        patentabilityAnalysis: null
    });

    const steps = [
        { id: 1, title: 'Basic Information', icon: 'fas fa-info-circle' },
        { id: 2, title: 'Technical Details', icon: 'fas fa-cogs' },
        { id: 3, title: 'Inventors & Applicants', icon: 'fas fa-users' },
        { id: 4, title: 'AI Generation', icon: 'fas fa-robot' },
        { id: 5, title: 'Prior Art Analysis', icon: 'fas fa-search' },
        { id: 6, title: 'Review & Submit', icon: 'fas fa-check-circle' }
    ];

    const handleGenerateClaims = async () => {
        setLoading(true);
        try {
            const claims = await aiService.generatePatentClaims(filingData);
            setFilingData(prev => ({ ...prev, claims }));
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSpecification = async () => {
        setLoading(true);
        try {
            const specification = await aiService.generateFullSpecification(filingData);
            setFilingData(prev => ({ ...prev, specification }));
        } finally {
            setLoading(false);
        }
    };

    const handlePriorArtSearch = async () => {
        setLoading(true);
        try {
            const results = await aiService.searchPriorArt(filingData.title + ' ' + filingData.description);
            setFilingData(prev => ({ ...prev, priorArt: results.results }));
        } finally {
            setLoading(false);
        }
    };

    const handlePatentabilityAnalysis = async () => {
        setLoading(true);
        try {
            const analysis = await aiService.analyzePatentability(filingData);
            setFilingData(prev => ({ ...prev, patentabilityAnalysis: analysis }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">New Patent Filing</h1>
                
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, idx) => (
                            <div key={step.id} className="flex flex-col items-center flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    currentStep >= step.id 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-gray-200 text-gray-500'
                                }`}>
                                    <i className={step.icon}></i>
                                </div>
                                <p className="text-xs mt-2 text-center">{step.title}</p>
                                {idx < steps.length - 1 && (
                                    <div className={`h-1 w-full mt-6 ${
                                        currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="min-h-[500px]">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Invention Title *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter a descriptive title for your invention"
                                    value={filingData.title}
                                    onChange={(e) => setFilingData({...filingData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Technical Field *
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        value={filingData.field}
                                        onChange={(e) => setFilingData({...filingData, field: e.target.value})}
                                    >
                                        <option value="">Select Field</option>
                                        <option value="software">Software/AI</option>
                                        <option value="biotech">Biotechnology</option>
                                        <option value="mechanical">Mechanical</option>
                                        <option value="electrical">Electrical</option>
                                        <option value="chemical">Chemical</option>
                                        <option value="medical">Medical Devices</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Invention Type *
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        value={filingData.type}
                                        onChange={(e) => setFilingData({...filingData, type: e.target.value})}
                                    >
                                        <option value="system">System</option>
                                        <option value="method">Method/Process</option>
                                        <option value="apparatus">Apparatus/Device</option>
                                        <option value="composition">Composition</option>
                                        <option value="software">Software</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    IPC Classification (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., G06F 17/30"
                                    value={filingData.classification}
                                    onChange={(e) => setFilingData({...filingData, classification: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Brief Description *
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    rows="4"
                                    placeholder="Provide a brief overview of your invention"
                                    value={filingData.description}
                                    onChange={(e) => setFilingData({...filingData, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Problem Addressed *
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        rows="3"
                                        placeholder="What problem does your invention solve?"
                                        value={filingData.problem}
                                        onChange={(e) => setFilingData({...filingData, problem: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Technical Solution *
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                        rows="3"
                                        placeholder="How does your invention solve this problem?"
                                        value={filingData.solution}
                                        onChange={(e) => setFilingData({...filingData, solution: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Key Advantages
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    rows="3"
                                    placeholder="List the main advantages of your invention"
                                    value={filingData.advantages}
                                    onChange={(e) => setFilingData({...filingData, advantages: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="text-center py-8">
                                <i className="fas fa-robot text-6xl text-purple-600 mb-4"></i>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">AI-Powered Generation</h2>
                                <p className="text-gray-600 mb-8">
                                    Use advanced AI to generate patent documents automatically
                                </p>

                                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                                    <button
                                        onClick={handleGenerateClaims}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                                    >
                                        <i className="fas fa-file-contract mr-2"></i>
                                        Generate Claims
                                    </button>
                                    <button
                                        onClick={handleGenerateSpecification}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                                    >
                                        <i className="fas fa-file-alt mr-2"></i>
                                        Generate Specification
                                    </button>
                                    <button
                                        onClick={handlePriorArtSearch}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                                    >
                                        <i className="fas fa-search mr-2"></i>
                                        Search Prior Art
                                    </button>
                                    <button
                                        onClick={handlePatentabilityAnalysis}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                                    >
                                        <i className="fas fa-chart-line mr-2"></i>
                                        Analyze Patentability
                                    </button>
                                </div>
                            </div>

                            {filingData.claims && (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="font-bold text-gray-800 mb-4">Generated Claims</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">Independent Claims</h4>
                                            {filingData.claims.independent.map((claim, idx) => (
                                                <p key={idx} className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">
                                                    {claim}
                                                </p>
                                            ))}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">Dependent Claims</h4>
                                            {filingData.claims.dependent.map((claim, idx) => (
                                                <p key={idx} className="text-sm text-gray-600 mb-2">
                                                    {claim}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={currentStep === 1}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        disabled={currentStep === steps.length}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

// Portfolio Management Component
function Portfolio() {
    const { patents } = useApp();
    const [selectedPatent, setSelectedPatent] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    const portfolioData = [
        {
            id: 'US10,123,456',
            title: 'AI-Powered Medical Diagnosis System',
            status: 'Granted',
            filingDate: '2021-03-15',
            grantDate: '2023-06-20',
            expiryDate: '2041-03-15',
            jurisdiction: 'United States',
            inventors: ['Dr. Jane Smith', 'John Doe'],
            assignee: 'MedTech Innovations Inc.',
            value: '$2.5M',
            citations: 47,
            maintenanceFee: { due: '2025-03-15', amount: '$1,600' },
            family: ['EP3234567', 'JP2022-123456'],
            claims: 25,
            description: 'An AI system for automated medical diagnosis using deep learning...'
        },
        {
            id: 'EP3,234,567',
            title: 'Quantum Computing Algorithm for Optimization',
            status: 'Published',
            filingDate: '2022-07-10',
            grantDate: null,
            expiryDate: '2042-07-10',
            jurisdiction: 'European Patent Office',
            inventors: ['Dr. Alice Johnson'],
            assignee: 'Quantum Solutions GmbH',
            value: '$1.8M',
            citations: 23,
            maintenanceFee: { due: '2024-07-10', amount: '€850' },
            family: ['US11,234,567', 'CN202210987'],
            claims: 18,
            description: 'A quantum algorithm for solving complex optimization problems...'
        }
    ];

    const getFilteredPatents = () => {
        let filtered = [...portfolioData];
        
        if (filter !== 'all') {
            filtered = filtered.filter(p => p.status.toLowerCase() === filter);
        }
        
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.filingDate) - new Date(a.filingDate);
                case 'value':
                    return parseFloat(b.value.replace(/[^0-9.]/g, '')) - parseFloat(a.value.replace(/[^0-9.]/g, ''));
                case 'citations':
                    return b.citations - a.citations;
                default:
                    return 0;
            }
        });
        
        return filtered;
    };

    return (
        <div className="fade-in">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Patent Portfolio</h1>
                    <div className="flex space-x-4">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="all">All Patents</option>
                            <option value="granted">Granted</option>
                            <option value="published">Published</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="value">Sort by Value</option>
                            <option value="citations">Sort by Citations</option>
                        </select>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            <i className="fas fa-plus mr-2"></i>Add Patent
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {getFilteredPatents().map(patent => (
                        <div
                            key={patent.id}
                            className="border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => setSelectedPatent(patent)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{patent.title}</h3>
                                    <p className="text-gray-500 text-sm">{patent.id}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    patent.status === 'Granted' ? 'bg-green-100 text-green-700' :
                                    patent.status === 'Published' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {patent.status}
                                </span>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{patent.description}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Filing Date</p>
                                    <p className="font-semibold">{patent.filingDate}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Jurisdiction</p>
                                    <p className="font-semibold">{patent.jurisdiction}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Est. Value</p>
                                    <p className="font-semibold text-green-600">{patent.value}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Citations</p>
                                    <p className="font-semibold">{patent.citations}</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <div className="text-sm">
                                    <p className="text-gray-500">Maintenance Fee</p>
                                    <p className="font-semibold">{patent.maintenanceFee.amount} due {patent.maintenanceFee.due}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="text-purple-600 hover:text-purple-700">
                                        <i className="fas fa-eye"></i>
                                    </button>
                                    <button className="text-purple-600 hover:text-purple-700">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="text-purple-600 hover:text-purple-700">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedPatent && (
                <PatentDetailModal patent={selectedPatent} onClose={() => setSelectedPatent(null)} />
            )}
        </div>
    );
}

// Patent Detail Modal
function PatentDetailModal({ patent, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{patent.title}</h2>
                        <p className="text-gray-500">{patent.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <p className="font-bold text-lg">{patent.status}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Portfolio Value</p>
                        <p className="font-bold text-lg text-green-600">{patent.value}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Citations</p>
                        <p className="font-bold text-lg">{patent.citations}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-600">{patent.description}</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-800 mb-2">Patent Family</h3>
                        <div className="flex space-x-2">
                            {patent.family.map(member => (
                                <span key={member} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                                    {member}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-800 mb-2">Actions</h3>
                        <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                <i className="fas fa-file-download mr-2"></i>Download Documents
                            </button>
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                <i className="fas fa-share mr-2"></i>Share
                            </button>
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                <i className="fas fa-chart-line mr-2"></i>Analytics
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}