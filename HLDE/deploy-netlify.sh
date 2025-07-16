#!/bin/bash
# Deploy to Netlify Drop
set -e

echo "🚀 Building VitePress documentation..."
npm run docs:build

echo "📦 Preparing deployment files..."
cd docs/.vitepress/dist

echo "✅ Files ready for deployment!"
echo "📁 Deployment directory: $(pwd)"
echo "📊 Files created:"
find . -type f -name "*.html" | head -10
echo "... and more files"

echo ""
echo "🌐 DEPLOYMENT INSTRUCTIONS:"
echo "1. Go to https://app.netlify.com/drop"
echo "2. Drag and drop the folder: $(pwd)"
echo "3. Your site will be deployed instantly!"
echo ""
echo "📍 Current deployment folder: $(pwd)"
echo "🎯 Main pages available:"
echo "  - index.html (Homepage)"
echo "  - modulos-clinicos/index.html (Medical Modules)"
echo "  - modulos-clinicos/00-navegacion-sistema/index.html (Navigation System)"
echo "  - modulos-clinicos/01-datos-paciente/index.html (Patient Data)"
echo "  - modulos-clinicos/02-cronologia-clinica/index.html (Clinical Timeline)"
echo "  - modulos-clinicos/03-diagnosticos/index.html (Diagnostics)"
echo "  - modulos-clinicos/04-tratamientos/index.html (Treatments)"
echo "  - modulos-clinicos/05-evaluaciones/index.html (Evaluations)"