#!/bin/bash

# Context Engineering - Vercel Deployment Fix Script
# Addresses routes-manifest.json missing issue for Vercel deployment

set -e

echo "🔧 Context Engineering - Vercel Deployment Fix"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Step 1: Backing up current configuration..."
cp next.config.js next.config.js.backup.$(date +%Y%m%d-%H%M%S)
cp vercel.json vercel.json.backup.$(date +%Y%m%d-%H%M%S)

echo "⚙️  Step 2: Applying Vercel-compatible configuration..."

# Update next.config.js for Vercel compatibility
echo "   - Disabling static export for Vercel compatibility"
sed -i.bak 's/output: .export./\/\/ output: "export", \/\/ Disabled for Vercel/' next.config.js

# Remove outputDirectory from vercel.json
echo "   - Removing outputDirectory specification from vercel.json"
sed -i.bak '/"outputDirectory": "out",/d' vercel.json

echo "🧹 Step 3: Cleaning previous builds..."
rm -rf .next out node_modules/.cache

echo "🔨 Step 4: Testing build configuration..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "📊 Step 5: Verifying manifest files..."
    if [ -f ".next/routes-manifest.json" ]; then
        echo "✅ routes-manifest.json found in .next directory"
    else
        echo "❌ routes-manifest.json still missing"
        exit 1
    fi
    
    echo ""
    echo "🎉 Vercel Deployment Fix Complete!"
    echo "=================================="
    echo ""
    echo "✅ Configuration updated for Vercel compatibility"
    echo "✅ Build process verified"
    echo "✅ Manifest files generated correctly"
    echo ""
    echo "📤 Next Steps:"
    echo "1. Deploy to Vercel: npm run deploy"
    echo "2. Or preview first: npm run preview"
    echo ""
    echo "📋 Configuration Changes Made:"
    echo "• Disabled static export in next.config.js"
    echo "• Removed outputDirectory from vercel.json" 
    echo "• Backups created with timestamp"
    echo ""
    echo "🔄 To revert changes:"
    echo "• Restore from backup files created"
    echo "• Or use next.config.static.js for static export"
    
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi