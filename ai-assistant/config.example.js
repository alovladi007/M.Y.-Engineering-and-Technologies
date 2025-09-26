// AI Assistant Configuration
// Copy this file to config.js and add your API keys

module.exports = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',
    model: 'gpt-4o-mini', // Use GPT-4o-mini for cost efficiency
    maxTokens: 1000,
    temperature: 0.7
  },
  
  // Alternative AI Services
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || 'your_anthropic_api_key_here',
    model: 'claude-3-haiku-20240307'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 5005,
    environment: process.env.NODE_ENV || 'development'
  }
};
