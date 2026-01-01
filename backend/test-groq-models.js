require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testModels() {
  try {
    console.log('Testing Groq models...\n');
    
    // Try different models - testing more current ones
    const models = [
      'llama-3.2-90b-vision-preview',
      'llama-3.2-11b-text-preview',
      'llama-3.1-405b-reasoning',
      'mixtral-8x7b',
      'deepseek-r1-distill-llama-70b',
      'llama3-70b-8192'
    ];

    for (const model of models) {
      try {
        console.log(`Testing model: ${model}...`);
        const response = await groq.chat.completions.create({
          messages: [{ role: 'user', content: 'Hello, what is 2+2?' }],
          model: model,
          max_tokens: 100,
          temperature: 0.5
        });
        console.log(`✅ ${model} is AVAILABLE\n`);
        return model; // Return first available model
      } catch (err) {
        console.log(`❌ ${model} error: ${err.message.substring(0, 100)}\n`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testModels();
