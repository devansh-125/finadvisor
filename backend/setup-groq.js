// Setup script for Groq API integration
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up FREE Groq AI for Financial Advisor\n');

console.log('📋 Steps to get FREE Groq API key:');
console.log('1. Go to: https://console.groq.com/');
console.log('2. Sign up for a free account');
console.log('3. Create an API key');
console.log('4. Copy the API key\n');

console.log('💡 Groq Benefits:');
console.log('✅ FREE tier with 50 requests/minute');
console.log('✅ Fast inference (Llama 3 8B model)');
console.log('✅ No credit card required');
console.log('✅ Perfect for financial advice\n');

console.log('🔧 To set up your API key:');
console.log('1. Open backend/.env file');
console.log('2. Replace the GROQ_API_KEY line with your actual key');
console.log('3. Restart the server\n');

console.log('🧪 Test command after setup:');
console.log('node -e "const axios = require(\'axios\'); axios.post(\'http://localhost:5000/api/ai/test-ai-models\', {question:\'How can I save money?\'}).then(r => console.log(\'✅ Groq AI working!\', r.data.response.substring(0,100)))"');

console.log('\n🎯 Ready to integrate Groq AI!');
