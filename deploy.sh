#!/bin/bash

# ResumeIQ Deployment Script
# This script prepares and deploys the application

echo "🚀 ResumeIQ Deployment Script"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean build artifacts
echo "📦 Step 1: Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Build artifacts cleaned${NC}"
echo ""

# Step 2: Install dependencies
echo "📥 Step 2: Installing dependencies..."
npm ci
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Run type check
echo "🔍 Step 3: Running type check..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠ Type check failed, but continuing...${NC}"
fi
echo ""

# Step 4: Build application
echo "🏗️  Step 4: Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Step 5: Test build locally (optional)
echo "🧪 Step 5: Would you like to test the build locally? (y/n)"
read -r test_local

if [ "$test_local" = "y" ]; then
    echo "Starting local server..."
    echo "Visit http://localhost:3000 to test"
    echo "Press Ctrl+C when done testing"
    npm run start
fi

# Step 6: Git operations
echo ""
echo "📝 Step 6: Git operations"
echo "Current git status:"
git status --short

echo ""
echo "Would you like to commit and push changes? (y/n)"
read -r do_commit

if [ "$do_commit" = "y" ]; then
    echo "Enter commit message:"
    read -r commit_message
    
    git add .
    git commit -m "$commit_message"
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Changes pushed to repository${NC}"
    else
        echo -e "${RED}✗ Failed to push changes${NC}"
        exit 1
    fi
fi

echo ""
echo "=============================="
echo -e "${GREEN}✓ Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Go to your deployment platform (Vercel/Netlify)"
echo "2. Clear the build cache"
echo "3. Trigger a new deployment"
echo "4. Verify environment variables are set"
echo "5. Test the deployed site"
echo ""
echo "Verification URLs:"
echo "- Health: https://your-domain.com/api/health"
echo "- Version: https://your-domain.com/api/version"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
