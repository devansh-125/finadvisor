/**
 * OpenAI Service - Wrapper/Factory for AI Services
 * Provides a unified interface for different AI providers
 */

const { OpenAIFinancialService } = require('./openrouterService');

let serviceInstance = null;

/**
 * Get or create the OpenAI service instance
 * @returns {OpenAIFinancialService} The OpenAI service instance
 */
function getOpenAIService() {
  if (!serviceInstance) {
    try {
      serviceInstance = new OpenAIFinancialService();
    } catch (err) {
      console.error('Failed to initialize OpenAI service:', err.message);
      // Return a mock service that won't crash the app
      return {
        async generateFinancialAdvice() {
          throw err;
        }
      };
    }
  }
  return serviceInstance;
}

module.exports = {
  getOpenAIService
};
