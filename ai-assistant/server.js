const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = 5005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize OpenAI (will use environment variable or fallback)
let openai;
try {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || 'demo-key', // Fallback for demo
    });
} catch (error) {
    console.log('OpenAI not configured, using fallback responses');
}

// M.Y Engineering Knowledge Base for AI Context
const companyContext = `
You are the AI Assistant for M.Y Engineering and Technologies, a leading provider of advanced technology solutions across eight specialized divisions:

1. **PowerFlow** - Advanced Power Electronics Platform
   - Native SST/DAB simulation
   - Real-time ZVS optimization
   - Integrated HIL testing
   - Applications: EV charging, renewable energy converters, industrial power supplies

2. **LUMA IP** - Legal Utility for Machine Assisted IP Analysis
   - AI-powered patent analysis
   - Automated patent filing
   - Prior art search and portfolio management
   - Applications: Patent drafting, IP analysis, legal research automation

3. **Cybersecurity Division** - Advanced Security Solutions
   - Threat detection and response
   - Network security monitoring
   - Vulnerability assessment
   - Applications: Enterprise security, government systems, critical infrastructure

4. **Hardware Division** - FPGA, Microchips & Electronics
   - Custom FPGA development
   - Microchip design and fabrication
   - Electronics prototyping
   - Applications: IoT devices, embedded systems, custom processors

5. **Biomedical Division** - Medical Imaging & AI
   - Medical imaging systems
   - AI-powered diagnostics
   - Biomedical signal processing
   - Applications: Medical equipment, diagnostic AI, wearable health devices

6. **Geospatial Division** - Satellite & Earth Observation
   - Satellite data processing
   - Earth observation systems
   - Geospatial analytics
   - Applications: Environmental monitoring, agriculture, urban planning

7. **O.R.I.O.N** - Nanotechnology & Advanced Materials
   - Nanomaterial synthesis
   - Advanced material characterization
   - Nanotechnology applications
   - Applications: Advanced electronics materials, sensors, energy storage

8. **Coming Soon** - New Division (placeholder for 8th division)

You should be helpful, knowledgeable, and professional. Provide detailed information about our technologies, help with technical questions, and guide users to the right solutions for their needs.
`;

// Real AI Agent Function
async function generateAIResponse(message, history = []) {
    // If OpenAI is not configured, use intelligent fallback
    if (!openai || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
        return generateIntelligentFallback(message, history);
    }

    try {
        // Prepare conversation history
        const messages = [
            {
                role: "system",
                content: companyContext
            },
            ...history.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: "user",
                content: message
            }
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return generateIntelligentFallback(message, history);
    }
}

// Intelligent Fallback System
function generateIntelligentFallback(message, history = []) {
    const lowerMessage = message.toLowerCase();
    
    // Analyze conversation context
    const recentTopics = history.slice(-4).map(h => h.content.toLowerCase());
    const contextKeywords = recentTopics.join(' ');
    
    // Dynamic responses based on context
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! I'm the M.Y Engineering AI Assistant. I can help you explore our eight specialized technology divisions, answer technical questions, and guide you to the right solutions. What would you like to know about our technologies?";
    }
    
    if (lowerMessage.includes('powerflow') || contextKeywords.includes('powerflow')) {
        return "PowerFlow is our advanced power electronics platform featuring native SST/DAB simulation, real-time ZVS optimization, and integrated HIL testing. It's perfect for electric vehicle charging systems, renewable energy converters, and industrial power supplies. What specific aspect of PowerFlow interests you?";
    }
    
    if (lowerMessage.includes('luma') || contextKeywords.includes('luma')) {
        return "LUMA IP is our AI-powered legal analysis platform that automates patent filing, performs prior art searches, and manages patent portfolios. It's designed for patent attorneys, IP professionals, and R&D teams. Would you like to know more about its specific capabilities?";
    }
    
    if (lowerMessage.includes('cybersecurity') || contextKeywords.includes('security')) {
        return "Our Cybersecurity Division provides advanced security solutions including threat detection, network monitoring, vulnerability assessment, and incident response. We serve enterprise clients, government agencies, and critical infrastructure. What security challenges are you facing?";
    }
    
    if (lowerMessage.includes('hardware') || contextKeywords.includes('fpga') || contextKeywords.includes('microchip')) {
        return "Our Hardware Division specializes in custom FPGA development, microchip design, electronics prototyping, and embedded systems. We work on IoT devices, custom processors, and hardware acceleration solutions. What hardware project are you working on?";
    }
    
    if (lowerMessage.includes('biomedical') || contextKeywords.includes('medical') || contextKeywords.includes('health')) {
        return "Our Biomedical Division develops medical imaging systems, AI-powered diagnostics, and biomedical signal processing solutions. We create medical equipment, diagnostic AI systems, and wearable health devices. What medical technology needs do you have?";
    }
    
    if (lowerMessage.includes('geospatial') || contextKeywords.includes('satellite') || contextKeywords.includes('earth')) {
        return "Our Geospatial Division processes satellite data, develops earth observation systems, and provides geospatial analytics. We support environmental monitoring, agriculture optimization, and urban planning. What geospatial challenges are you addressing?";
    }
    
    if (lowerMessage.includes('orion') || contextKeywords.includes('nano') || contextKeywords.includes('material')) {
        return "O.R.I.O.N focuses on nanotechnology and advanced materials including nanomaterial synthesis, material characterization, and nanotechnology applications. We develop materials for electronics, sensors, and energy storage. What material science questions do you have?";
    }
    
    if (lowerMessage.includes('technology') || lowerMessage.includes('tech')) {
        return "M.Y Engineering spans eight cutting-edge technology divisions: PowerFlow (power electronics), LUMA IP (AI legal analysis), Cybersecurity, Hardware (FPGA/microchips), Biomedical (medical imaging), Geospatial (satellite systems), O.R.I.O.N (nanotechnology), and our upcoming 8th division. Which technology area aligns with your project needs?";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return "I'm here to help you explore M.Y Engineering's technology solutions! I can provide detailed information about our eight divisions, answer technical questions, and help you find the right solutions for your projects. What specific help do you need?";
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('reach')) {
        return "For detailed technical discussions, project consultations, or business partnerships, I recommend reaching out to our team through the main M.Y Engineering website. I can provide initial guidance, but our experts can give you comprehensive support for your specific needs.";
    }
    
    // Context-aware responses
    if (contextKeywords.includes('project') || contextKeywords.includes('development')) {
        return "Based on our conversation, it sounds like you're working on a project that could benefit from our technology solutions. Could you tell me more about your specific requirements? I can help identify which of our eight divisions might be the best fit for your needs.";
    }
    
    if (contextKeywords.includes('cost') || contextKeywords.includes('price') || contextKeywords.includes('budget')) {
        return "Pricing varies based on the specific solution, project scope, and requirements. Our solutions are designed to be cost-effective and scalable. For detailed pricing information, I'd recommend discussing your specific needs with our sales team through the main website.";
    }
    
    // Default intelligent response
    return "That's an interesting question! I'd be happy to help you explore how M.Y Engineering's technologies might apply to your situation. Could you provide more details about what you're looking for? I can then guide you to the most relevant division or solution from our eight specialized areas.";
}

// API Routes
app.post('/api/ai-assistant', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        console.log('AI Request:', { message, historyLength: history?.length || 0 });
        
        // Generate AI response using real AI Agent
        const response = await generateAIResponse(message, history || []);
        
        console.log('AI Response generated:', response.substring(0, 100) + '...');
        
        res.json({
            response: response,
            timestamp: new Date().toISOString(),
            aiPowered: true
        });
        
    } catch (error) {
        console.error('AI Assistant Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            response: "I'm sorry, I encountered an error processing your request. Please try again.",
            aiPowered: false
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
