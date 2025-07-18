# Deployment Reference - REDIRECTED

**DEPRECATED**: This file has been CONSOLIDATED into the single authoritative deployment guide.

**REDIRECT TO**: [Deployment Guide](./deployment-guide.md) - AUTHORITATIVE single source for ALL deployment procedures, Vercel configuration, production optimization, and troubleshooting protocols

**STATUS**: This file is REDUNDANT and scheduled for archive. All content has been FULLY INTEGRATED into the comprehensive deployment guide.

---

## 🔄 Content Migration Complete

This file contained 777 lines of deployment content that has been FULLY INTEGRATED into the consolidated deployment guide:

- ✅ **Pre-deployment checklist** - Migrated to deployment-guide.md
- ✅ **Vercel configuration** - Enhanced in deployment-guide.md  
- ✅ **Performance optimization** - Consolidated in deployment-guide.md
- ✅ **Security configuration** - Unified in deployment-guide.md
- ✅ **Monitoring and analytics** - Integrated in deployment-guide.md
- ✅ **Troubleshooting procedures** - Comprehensively covered in deployment-guide.md

## 🎯 Access Consolidated Authority

**USE THIS INSTEAD**: [deployment-guide.md](./deployment-guide.md)

The deployment guide now contains ALL unique content from this file plus enhanced coverage of:
- Complete pre-deployment checklists and validation procedures
- Detailed Vercel configuration with security headers
- Comprehensive troubleshooting including routes-manifest.json fix
- Performance optimization and monitoring protocols
- Post-deployment verification and maintenance procedures

**Consolidated Content**: Complete deployment manual with:
- Production deployment procedures
- Vercel configuration optimization  
- Security and performance settings
- Troubleshooting and error resolution
- Post-deployment verification protocols

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#-pre-deployment-checklist)
2. [Vercel Deployment](#-vercel-deployment)
3. [Configuration & Optimization](#-configuration--optimization)
4. [Environment Setup](#-environment-setup)
5. [Performance Optimization](#-performance-optimization)
6. [Security Configuration](#-security-configuration)
7. [Monitoring & Analytics](#-monitoring--analytics)
8. [Troubleshooting](#-troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Essential Pre-Deployment Steps

****1. Code Quality Verification****
```bash
# Run comprehensive tests
npm run type-check     # TypeScript validation
npm run lint          # ESLint code quality
npm run build         # Production build test
npm run test          # Component and unit tests (if configured)
```

****2. Performance Optimization****
```bash
# Bundle analysis
npm install --save-dev @next/bundle-analyzer
ANALYZE=true npm run build

# Performance audit
npm install --save-dev lighthouse
npx lighthouse http://localhost:3000 --view
```

### **3. Content Validation**
- ✅ All 7 interactive features functional
- ✅ Mathematical formulas rendering correctly (KaTeX)
- ✅ Navigation system working (≤3 cognitive steps)
- ✅ Dark/light theme toggle operational
- ✅ Mobile responsiveness verified
- ✅ Accessibility compliance (WCAG 2.1 AA)

****4. Dependencies Audit****
```bash
# Security audit
npm audit
npm audit fix

# Update dependencies
npm update
npm outdated
```

****5. Build Optimization****
```bash
# Static export test (Vercel optimization)
npm run build
npm run export

# Verify output directory
ls -la out/
```

---

## 🚀 Vercel Deployment

### Method 1: Vercel CLI Deployment (Recommended)

****Step 1: Install Vercel CLI****
```bash
# Install globally
npm i -g vercel

# Login to Vercel
vercel login
```

****Step 2: Initialize Project****
```bash
# From project root directory
vercel

# Follow prompts:
# ? Set up and deploy "~/claude-context-engineering"? [Y/n] Y
# ? Which scope do you want to deploy to? [your-username]
# ? Link to existing project? [y/N] N
# ? What's your project's name? context-engineering
# ? In which directory is your code located? ./
```

****Step 3: Configure Project Settings****
```bash
# Automatic configuration detection
# ✓ Framework: Next.js
# ✓ Build Command: npm run build
# ✓ Output Directory: .next (auto-detected)
# ✓ Development Command: npm run dev
```

****Step 4: Deploy to Production****
```bash
# Deploy to production
vercel --prod

# Custom domain (optional)
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com
```

### Method 2: GitHub Integration Deployment

****Step 1: Push to GitHub****
```bash
# Initialize git repository (if not already)
git init
git add .
git commit -m "Initial commit: Context Engineering web application"

# Add remote repository
git remote add origin https://github.com/your-username/claude-context-engineering.git
git push -u origin main
```

### **Step 2: Connect to Vercel**
1. Visit [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub repository
4. Select `claude-context-engineering`
5. Configure settings (auto-detected)
6. Deploy

****Step 3: Automatic Deployments****
- **Main Branch**: Automatic production deployments
- **Feature Branches**: Preview deployments for testing
- **Pull Requests**: Automatic preview environments

---

## ⚙️ Configuration & Optimization

### Vercel Configuration File

Create `vercel.json` in project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "trailingSlash": false,
  "cleanUrls": true,
  "regions": ["iad1", "sfo1", "fra1"],
  "functions": {
    "app/**": {
      "runtime": "nodejs18.x",
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ]
}
```

### Next.js Configuration Optimization

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  
  // Static export for Vercel optimization
  output: 'export',
  trailingSlash: false,
  
  // Image optimization for static export
  images: {
    unoptimized: true,
    domains: ['cdn.jsdelivr.net'], // KaTeX CDN
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Bundle analysis (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
        })
      )
      return config
    },
  }),
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://context-engineering.vercel.app',
    NEXT_PUBLIC_APP_NAME: 'Context Engineering',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Advanced AI Interaction Methodology Platform',
  },
}

module.exports = nextConfig
```

### Package.json Optimization

Add deployment scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export",
    "deploy": "vercel --prod",
    "preview": "vercel",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "analyze": "ANALYZE=true npm run build",
    "lighthouse": "lighthouse http://localhost:3000 --view",
    "clean": "rm -rf .next out node_modules/.cache"
  }
}
```

---

## 🌍 Environment Setup

### Environment Variables

****Production Environment** (`.env.production`)**
```bash
# Application Configuration
NEXT_PUBLIC_APP_URL=https://context-engineering.vercel.app
NEXT_PUBLIC_APP_NAME="Context Engineering"
NEXT_PUBLIC_APP_DESCRIPTION="Advanced AI Interaction Methodology Platform"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

# External Services
NEXT_PUBLIC_KATEX_CDN=https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/

# Performance Configuration
NEXT_PUBLIC_LAZY_LOADING=true
NEXT_PUBLIC_PROGRESSIVE_LOADING=true
```

### **Vercel Environment Variables Setup**
```bash
# Set environment variables via CLI
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS production

# Or via Vercel Dashboard:
# Project Settings → Environment Variables → Add
```

### Build Environment

****Node.js Version****
Specify in `.nvmrc`:
```text
18.17.0
```

### **Package Manager**
Specify in `package.json`:
```json
{
  "engines": {
    "node": ">=18.17.0",
    "npm": ">=9.0.0"
  }
}
```

---

## ⚡ Performance Optimization

### Static Site Generation (SSG)

The application is optimized for static generation:

```javascript
// Automatic static generation for all pages
export default function Page() {
  return <YourComponent />
}

// No getServerSideProps needed - fully static
```

### Bundle Optimization

### **Code Splitting**
```javascript
// Automatic code splitting for interactive features
const CommandSimulator = dynamic(() => import('@/components/interactive/CommandSimulator'), {
  loading: () => <LoadingCard className="h-48" />,
  ssr: false // Client-side only for interactive features
})
```

****Tree Shaking****
```javascript
// Optimized imports
import { Terminal, Brain, Sparkles } from 'lucide-react' // Tree-shaken
import { motion } from 'framer-motion' // Tree-shaken
```

### CDN Optimization

### **KaTeX CDN Configuration**
```css
/* globals.css - KaTeX from CDN */
@import url('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css');
```

### **Font Optimization**
```javascript
// Font loading optimization
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

### Performance Monitoring

****Core Web Vitals Optimization****
- **LCP (Largest Contentful Paint)**: <2.5s ✅
- **FID (First Input Delay)**: <100ms ✅  
- **CLS (Cumulative Layout Shift)**: <0.1 ✅

****Bundle Size Targets****
- **Initial Bundle**: <100KB ✅
- **Total JavaScript**: <300KB ✅
- **First Paint**: <1.5s ✅

---

## 🔒 Security Configuration

### Security Headers

Implemented via `vercel.json` headers configuration:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' https://cdn.jsdelivr.net;"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### HTTPS Configuration

Vercel automatically provides:
- **SSL/TLS Certificates**: Automatic Let's Encrypt certificates
- **HTTP to HTTPS Redirect**: Automatic redirection
- **HSTS Headers**: HTTP Strict Transport Security
- **Certificate Renewal**: Automatic certificate management

### Content Security Policy

Optimized for KaTeX and interactive features:

```javascript
// CSP Configuration
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  img-src 'self' data: https:;
  font-src 'self' https://cdn.jsdelivr.net;
  connect-src 'self';
  frame-ancestors 'none';
`
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics Integration

****Enable Vercel Analytics****
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to app layout
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Performance Monitoring

### **Web Vitals Tracking**
```javascript
// pages/_app.js or app/layout.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric)
}

// Track Core Web Vitals
getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### **Real User Monitoring (RUM)**
```javascript
// Custom performance monitoring
export function trackPerformance(eventName, data) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      custom_parameter_1: data.value,
      custom_parameter_2: data.context,
    })
  }
}
```

### Error Monitoring

### **Error Boundary Implementation**
```javascript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Application error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

---

## 🔧 Troubleshooting

### Common Deployment Issues

****Build Failures****

**Issue: TypeScript Errors**
```bash
# Solution: Fix type errors
npm run type-check
# Fix reported errors before deployment
```

**Issue: ESLint Errors**
```bash
# Solution: Fix linting issues
npm run lint
npm run lint -- --fix  # Auto-fix when possible
```

**Issue: Memory Issues During Build**
```bash
# Solution: Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

****Runtime Issues****

**Issue: Mathematical Formulas Not Rendering**
**Symptoms**: Raw LaTeX visible instead of formatted math
**Solution**:
```javascript
// Ensure KaTeX CSS is loaded
// Check network tab for CDN loading issues
// Verify CSP allows cdn.jsdelivr.net
```

**Issue: Interactive Features Not Working**
**Symptoms**: Components not loading or functioning
**Solution**:
```bash
# Check browser console for JavaScript errors
# Verify all dependencies are installed
# Check for CSP violations
```

**Issue: Poor Performance**
**Symptoms**: Slow loading, high bundle size
**Solution**:
```bash
# Analyze bundle
npm run analyze

# Check for large dependencies
npm ls --depth=0

# Optimize imports
# Use dynamic imports for large components
```

### Vercel-Specific Issues

****Deployment Timeout****
```bash
# Increase build timeout in vercel.json
{
  "functions": {
    "app/**": {
      "maxDuration": 15
    }
  }
}
```

****Function Size Limits****
```bash
# Optimize bundle size
# Use dynamic imports
# Split large components
```

****Environment Variable Issues****
```bash
# Check variables are set
vercel env ls

# Pull environment to local
vercel env pull .env.local
```

### Performance Troubleshooting

****Slow Loading Times****
1. **Check CDN Configuration**: Verify KaTeX CDN loading
2. **Bundle Analysis**: Use `npm run analyze` to identify large dependencies
3. **Network Issues**: Check for failed resource loading
4. **Progressive Loading**: Ensure lazy loading is working correctly

****Memory Issues****
1. **Component Cleanup**: Ensure proper component unmounting
2. **Memory Leaks**: Check for event listener cleanup
3. **Large Data Sets**: Implement virtualization for large lists
4. **Image Optimization**: Use Next.js Image component properly

---

## 🚀 Post-Deployment Checklist

### Immediate Verification

### **Functional Testing**
- [ ] Homepage loads correctly
- [ ] All 7 interactive features functional
- [ ] Navigation system working (≤3 cognitive steps)
- [ ] Mathematical formulas rendering (KaTeX)
- [ ] Dark/light theme toggle
- [ ] Mobile responsiveness
- [ ] Search functionality

****Performance Testing****
```bash
# Run Lighthouse audit
lighthouse https://your-domain.vercel.app --view

# Check Core Web Vitals
# LCP < 2.5s
# FID < 100ms  
# CLS < 0.1
```

****Security Testing****
```bash
# Check security headers
curl -I https://your-domain.vercel.app

# Verify HTTPS redirect
curl -I http://your-domain.vercel.app
```

### Ongoing Monitoring

****Weekly Checks****
- [ ] Performance metrics review
- [ ] Error monitoring dashboard
- [ ] User analytics review
- [ ] Security scan results

****Monthly Maintenance****
- [ ] Dependency updates
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Content updates and improvements

### Success Metrics

****Performance Targets** (Post-Deployment)**
- **Success Rate**: Maintain 88%+ command execution success
- **Context Efficiency**: Maintain 78%+ context reduction
- **Navigation Speed**: Maintain 65%+ improvement (≤190ms)
- **User Engagement**: Track feature usage and completion rates

****Technical Metrics****
- **Uptime**: 99.9%+ availability
- **Load Time**: <2s first contentful paint
- **Error Rate**: <1% JavaScript errors
- **Security**: Zero security vulnerabilities

---

## 📞 Support & Resources

### Documentation
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Project README**: Complete setup and usage guide
- **User Guide**: Comprehensive user manual

### Community Support
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Next.js Community**: [github.com/vercel/next.js/discussions](https://github.com/vercel/next.js/discussions)
- **Project Issues**: GitHub issues for bug reports and feature requests

### Professional Support
- **Vercel Pro**: Enhanced support and features
- **Enterprise Support**: Dedicated support for large deployments
- **Custom Solutions**: Professional services for advanced requirements

---

**Deployment Complete!** 🎉

Your Context Engineering application is now live and optimized for production use. The deployment includes:

- ✅ **High Performance**: Optimized bundle, CDN delivery, static generation
- ✅ **Security**: Comprehensive security headers and HTTPS
- ✅ **Monitoring**: Analytics, error tracking, performance monitoring  
- ✅ **Scalability**: Edge runtime, global CDN, automatic scaling
- ✅ **Reliability**: 99.9% uptime, automatic failover, health monitoring

For ongoing maintenance and optimization, refer to the monitoring and troubleshooting sections above.

**Live URL**: `https://your-domain.vercel.app`  
**Performance**: Optimized for 88%+ success rate, 78%+ context efficiency  
**Features**: All 7 interactive features fully operational  
**Support**: Comprehensive documentation and community resources available
