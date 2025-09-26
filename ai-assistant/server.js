const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// AI Knowledge Base
const knowledgeBase = {
    "powerflow": {
        name: "PowerFlow",
        description: "Advanced Power Electronics Platform",
        features: [
            "Native SST/DAB simulation",
            "Real-time ZVS optimization", 
            "Integrated HIL testing",
            "Power electronics design and simulation",
            "Advanced control algorithms"
        ],
        applications: [
            "Electric vehicle charging systems",
            "Renewable energy converters",
            "Industrial power supplies",
            "Grid-tie inverters"
        ]
    },
    "luma ip": {
        name: "LUMA IP",
        description: "Legal Utility for Machine Assisted IP Analysis",
        features: [
            "AI-powered patent analysis",
            "Automated patent filing",
            "Prior art search",
            "Patent portfolio management",
            "Legal document generation"
        ],
        applications: [
            "Patent application drafting",
            "IP portfolio analysis",
            "Legal research automation",
            "Intellectual property management"
        ]
    },
    "cybersecurity": {
        name: "Cybersecurity Division",
        description: "Advanced Security Solutions",
        features: [
            "Threat detection and response",
            "Network security monitoring",
            "Vulnerability assessment",
            "Security architecture design",
            "Incident response planning"
        ],
        applications: [
            "Enterprise security solutions",
            "Government security systems",
            "Critical infrastructure protection",
            "Cloud security services"
        ]
    },
    "hardware": {
        name: "Hardware Division",
        description: "FPGA, Microchips & Electronics",
        features: [
            "Custom FPGA development",
            "Microchip design and fabrication",
            "Electronics prototyping",
            "Hardware optimization",
            "Embedded systems development"
        ],
        applications: [
            "IoT device development",
            "Embedded computing systems",
            "Custom processor design",
            "Hardware acceleration solutions"
        ]
    },
    "biomedical": {
        name: "Biomedical Division",
        description: "Medical Imaging & AI",
        features: [
            "Medical imaging systems",
            "AI-powered diagnostics",
            "Biomedical signal processing",
            "Medical device development",
            "Healthcare data analytics"
        ],
        applications: [
            "Medical imaging equipment",
            "Diagnostic AI systems",
            "Wearable health devices",
            "Telemedicine platforms"
        ]
    },
    "geospatial": {
        name: "Geospatial Division",
        description: "Satellite & Earth Observation",
        features: [
            "Satellite data processing",
            "Earth observation systems",
            "Geospatial analytics",
            "Remote sensing technology",
            "GIS solutions"
        ],
        applications: [
            "Environmental monitoring",
            "Agriculture optimization",
            "Urban planning",
            "Disaster management"
        ]
    },
    "orion": {
        name: "O.R.I.O.N",
        description: "Nanotechnology & Advanced Materials",
        features: [
            "Nanomaterial synthesis",
            "Advanced material characterization",
            "Nanotechnology applications",
            "Material property optimization",
            "Research and development"
        ],
        applications: [
            "Advanced materials for electronics",
            "Nanotechnology-based sensors",
            "Energy storage materials",
            "Aerospace materials"
        ]
    }
};

// AI Response Generator
function generateAIResponse(message, history = []) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! I'm the M.Y Engineering AI Assistant. I can help you learn about our eight specialized divisions, their technologies, and how they can benefit your projects. What would you like to know more about?";
    }
    
    // Division-specific queries
    for (const [key, division] of Object.entries(knowledgeBase)) {
        if (lowerMessage.includes(key)) {
            return generateDivisionResponse(division);
        }
    }
    
    // Technology queries
    if (lowerMessage.includes('technology') || lowerMessage.includes('tech')) {
        return "M.Y Engineering specializes in cutting-edge technologies across eight divisions: PowerFlow (power electronics), LUMA IP (AI-powered legal analysis), Cybersecurity, Hardware (FPGA/microchips), Biomedical (medical imaging), Geospatial (satellite systems), O.R.I.O.N (nanotechnology), and our upcoming 8th division. Which technology area interests you most?";
    }
    
    // Product queries
    if (lowerMessage.includes('product') || lowerMessage.includes('solution')) {
        return "We offer comprehensive solutions across multiple technology domains. Our products include PowerFlow simulation platforms, LUMA IP patent analysis tools, cybersecurity solutions, custom hardware designs, medical imaging systems, satellite data processing, and advanced nanomaterials. Would you like specific information about any of these product categories?";
    }
    
    // Contact/support queries
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
        return "For technical support, product inquiries, or business partnerships, you can reach our team through the main M.Y Engineering website. We provide comprehensive support for all our divisions and are always happy to discuss how our technologies can meet your specific needs.";
    }
    
    // Pricing queries
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
        return "Pricing varies depending on the specific solution and requirements. For detailed pricing information, I recommend contacting our sales team through the main website. We offer flexible pricing models tailored to your project needs and scale.";
    }
    
    // General company info
    if (lowerMessage.includes('company') || lowerMessage.includes('about') || lowerMessage.includes('who')) {
        return "M.Y Engineering and Technologies is a leading provider of advanced technology solutions across eight specialized divisions. We combine cutting-edge research with practical applications to deliver innovative solutions in power electronics, AI-powered legal analysis, cybersecurity, hardware development, biomedical technology, geospatial systems, and nanotechnology.";
    }
    
    // Default response
    return "I understand you're interested in learning more about M.Y Engineering. We have eight specialized divisions covering power electronics, AI-powered legal analysis, cybersecurity, hardware development, biomedical technology, geospatial systems, and nanotechnology. Could you be more specific about what you'd like to know? I can provide detailed information about any of our divisions or technologies.";
}

function generateDivisionResponse(division) {
    return `**${division.name}** - ${division.description}

**Key Features:**
${division.features.map(feature => `• ${feature}`).join('\n')}

**Applications:**
${division.applications.map(app => `• ${app}`).join('\n')}

Would you like more specific information about ${division.name} or any of its applications?`;
}

// API Routes
app.post('/api/ai-assistant', (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Generate AI response
        const response = generateAIResponse(message, history);
        
        res.json({
            response: response,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('AI Assistant Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            response: "I'm sorry, I encountered an error processing your request. Please try again."
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'M.Y Engineering AI Assistant'
    });
});

// Serve the AI Assistant interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🤖 M.Y Engineering AI Assistant running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/ai-assistant`);
});

module.exports = app;
