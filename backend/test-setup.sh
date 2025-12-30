#!/bin/bash
# Test script for Gemini AI Financial Advisor

echo "=========================================="
echo "  Gemini AI Financial Advisor - Test Suite"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check 1: Node modules installed
echo -e "${YELLOW}[1/5]${NC} Checking dependencies..."
if [ -d "node_modules/@google/generative-ai" ]; then
    echo -e "${GREEN}✓${NC} Gemini API package installed"
else
    echo -e "${RED}✗${NC} Gemini API package NOT found. Run: npm install @google/generative-ai"
fi
echo ""

# Check 2: Service files exist
echo -e "${YELLOW}[2/5]${NC} Checking service modules..."
files=(
    "services/transactionAnalyzer.js"
    "services/ruleEngine.js"
    "services/geminiAI.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file missing"
    fi
done
echo ""

# Check 3: Environment variables
echo -e "${YELLOW}[3/5]${NC} Checking environment setup..."
if grep -q "GEMINI_API_KEY" .env; then
    echo -e "${GREEN}✓${NC} GEMINI_API_KEY found in .env"
    if grep -q "your_gemini_api_key_here" .env; then
        echo -e "${YELLOW}⚠${NC}  WARNING: GEMINI_API_KEY is still a placeholder"
        echo "   Please set your actual key: edit .env and replace placeholder"
    else
        echo -e "${GREEN}✓${NC} GEMINI_API_KEY appears to be set"
    fi
else
    echo -e "${RED}✗${NC} GEMINI_API_KEY not found in .env"
fi
echo ""

# Check 4: API routes
echo -e "${YELLOW}[4/5]${NC} Checking API routes..."
if grep -q "router.post.*query" routes/ai.js && \
   grep -q "TransactionAnalyzer" routes/ai.js && \
   grep -q "RuleEngine" routes/ai.js && \
   grep -q "getGeminiInstance" routes/ai.js; then
    echo -e "${GREEN}✓${NC} AI routes properly configured with all three layers"
else
    echo -e "${RED}✗${NC} AI routes incomplete"
fi
echo ""

# Check 5: Port check
echo -e "${YELLOW}[5/5]${NC} Backend port status..."
if [ -n "$PORT" ]; then
    echo "Backend running on port: $PORT"
else
    echo "Port from .env: 5000 (default)"
fi
echo ""

echo "=========================================="
echo "  Setup Checklist"
echo "=========================================="
echo ""
echo "Before running the app:"
echo "  [ ] Add real GEMINI_API_KEY to .env"
echo "  [ ] Ensure MongoDB connection works"
echo "  [ ] Run: npm install @google/generative-ai"
echo ""
echo "To start the backend:"
echo "  npm run dev"
echo ""
echo "Then test the API:"
echo "  GET  http://localhost:5000/api/ai/test       (Test API connection)"
echo "  POST http://localhost:5000/api/ai/query      (Ask a question)"
echo "  GET  http://localhost:5000/api/ai/health     (Get health score)"
echo "  GET  http://localhost:5000/api/ai/recommendations (Get recommendations)"
echo ""
echo "=========================================="
