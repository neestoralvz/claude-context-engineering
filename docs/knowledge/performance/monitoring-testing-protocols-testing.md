# Testing & Regression Framework

**Module Purpose**: MANDATORY automated performance testing infrastructure with Lighthouse CI integration, regression detection, and continuous integration pipeline for the Context Engineering ecosystem.

**Navigation**: [← Main Hub](./monitoring-testing-protocols.md) | [← Real-Time Core](./monitoring-testing-protocols-core.md) | [Analytics & Results →](./monitoring-testing-protocols-analytics.md)

**Integration**: [Performance Hub](../strategies/PERFORMANCE_OPTIMIZATION.md) | [Bundle & Runtime Optimization](./bundle-runtime-optimization.md)

---

## 🧪 Automated Performance Testing

### **Lighthouse CI Integration**

### **Comprehensive Lighthouse Configuration**
```javascript
// lighthouse-ci.config.js - Complete CI configuration
module.exports = {
  ci: {
    collect: {
      // Multiple URL testing for comprehensive coverage
      url: [
        'http://localhost:3000',                    // Homepage
        'http://localhost:3000/interactive',       // Interactive features
        'http://localhost:3000/principles',        // Core principles
        'http://localhost:3000/commands',          // Command system
        'http://localhost:3000/commands/search?q=optimize'  // Dynamic content
      ],
      numberOfRuns: 3,  // Multiple runs for statistical accuracy
      settings: {
        chromeFlags: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-dev-shm-usage'
        ],
        // Simulate different network conditions
        throttling: {
          rttMs: 40,      // 40ms RTT
          throughputKbps: 10240,  // 10 Mbps
          cpuSlowdownMultiplier: 1
        },
        // Device emulation
        emulatedFormFactor: 'desktop',
        // Advanced options
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: ['uses-http2']  // Skip audits not applicable to our setup
      }
    },
    assert: {
      assertions: {
        // Performance category requirements
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals thresholds
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        
        // Resource optimization
        'unused-css-rules': ['warn', { maxNumericValue: 20000 }],
        'unused-javascript': ['warn', { maxNumericValue: 30000 }],
        'modern-image-formats': ['warn', { minScore: 0.8 }],
        
        // Context Engineering specific metrics
        'interactive': ['error', { maxNumericValue: 3000 }],
        'max-potential-fid': ['error', { maxNumericValue: 130 }]
      }
    },
    upload: {
      target: 'temporary-public-storage',
      // Store results for historical analysis
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN
    },
    server: {
      // Store historical data
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lighthouse-ci-results.db'
      }
    }
  }
};
```

### **Custom Performance Tests**
```typescript
// tests/performance/comprehensive-performance.test.ts
import { test, expect } from '@playwright/test';

describe('Comprehensive Performance Tests', () => {
  let performanceMetrics: PerformanceMetrics;
  
  beforeEach(async ({ page }) => {
    // Clear cache for consistent testing
    await page.context().clearCookies();
    await page.context().clearPermissions();
    
    // Setup performance monitoring
    await page.addInitScript(() => {
      window.performanceMetrics = [];
      window.originalFetch = window.fetch;
      
      // Monitor all network requests
      window.fetch = (...args) => {
        const startTime = performance.now();
        return window.originalFetch(...args).then(response => {
          window.performanceMetrics.push({
            type: 'fetch',
            duration: performance.now() - startTime,
            url: args[0],
            status: response.status
          });
          return response;
        });
      };
    });
  });
  
  test('homepage loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate and wait for core content
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="philosophical-core"]', { timeout: 10000 });
    
    // Measure overall load time
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // 2 second budget
    
    // Check Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    if (webVitals.fcp) expect(webVitals.fcp).toBeLessThan(1800);
    if (webVitals.lcp) expect(webVitals.lcp).toBeLessThan(2500);
  });
  
  test('interactive features load progressively without blocking', async ({ page }) => {
    await page.goto('http://localhost:3000/interactive');
    
    // Test each interactive feature loading
    const features = [
      'command-simulator',
      'decision-engine', 
      'progressive-thinking',
      'live-metrics'
    ];
    
    for (const feature of features) {
      const startTime = Date.now();
      
      // Click feature card
      await page.click(`[data-testid="${feature}-card"]`);
      
      // Wait for feature interface to load
      await page.waitForSelector(`[data-testid="${feature}-interface"]`, { timeout: 5000 });
      
      const loadTime = Date.now() - startTime;
      
      // Feature-specific budget validation
      const budgets = {
        'command-simulator': 3000,
        'decision-engine': 2500,
        'progressive-thinking': 3500,
        'live-metrics': 2000
      };
      
      expect(loadTime).toBeLessThan(budgets[feature]);
      
      // Verify no long tasks during loading
      const longTasks = await page.evaluate(() => {
        return window.performanceMetrics.filter(m => m.type === 'longtask' && m.duration > 50);
      });
      
      expect(longTasks.length).toBeLessThan(3); // Max 3 long tasks allowed
    }
  });
  
  test('mathematical formulas render efficiently', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test formula rendering performance
    const formulaSelectors = [
      '[data-testid="efficiency-formula"]',
      '[data-testid="context-reduction-formula"]',
      '[data-testid="navigation-formula"]',
      '[data-testid="performance-formula"]'
    ];
    
    const renderingResults = [];
    
    for (const selector of formulaSelectors) {
      const startTime = Date.now();
      
      // Wait for formula to be visible and rendered
      await page.waitForSelector(selector, { state: 'visible' });
      
      // Check if KaTeX has processed the formula
      const isRendered = await page.locator(selector).locator('.katex').count() > 0;
      expect(isRendered).toBeTruthy();
      
      const renderTime = Date.now() - startTime;
      renderingResults.push({ selector, renderTime });
      
      // Individual formula budget
      expect(renderTime).toBeLessThan(500); // 500ms budget per formula
    }
    
    // Average rendering time should be excellent
    const avgRenderTime = renderingResults.reduce((sum, r) => sum + r.renderTime, 0) / renderingResults.length;
    expect(avgRenderTime).toBeLessThan(200); // 200ms average
  });
  
  test('memory usage remains within acceptable limits', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate through different sections to test memory accumulation
    const sections = ['/interactive', '/principles', '/commands', '/'];
    
    for (const section of sections) {
      await page.goto(`http://localhost:3000${section}`);
      
      // Wait for content to load
      await page.waitForLoadState('networkidle');
      
      // Measure memory usage
      const memoryUsage = await page.evaluate(() => {
        if ('memory' in performance) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (memoryUsage) {
        // Memory should not exceed 50MB
        expect(memoryUsage.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
        
        // Memory usage should be reasonable compared to limit
        const memoryUtilization = memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit;
        expect(memoryUtilization).toBeLessThan(0.3); // Less than 30% of heap limit
      }
    }
  });
  
  test('bundle sizes remain within budget', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check resource loading performance
    const resourceTimings = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(entry => ({
        name: entry.name,
        transferSize: entry.transferSize,
        duration: entry.duration,
        type: entry.initiatorType
      }));
    });
    
    // JavaScript bundle size validation
    const jsResources = resourceTimings.filter(r => r.name.includes('.js'));
    const totalJSSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
    
    expect(totalJSSize).toBeLessThan(500 * 1024); // 500KB total JS budget
    
    // CSS bundle size validation
    const cssResources = resourceTimings.filter(r => r.name.includes('.css'));
    const totalCSSSize = cssResources.reduce((sum, r) => sum + r.transferSize, 0);
    
    expect(totalCSSSize).toBeLessThan(100 * 1024); // 100KB total CSS budget
    
    // Individual resource loading time
    resourceTimings.forEach(resource => {
      if (resource.transferSize > 50 * 1024) { // Files larger than 50KB
        expect(resource.duration).toBeLessThan(1000); // Should load within 1 second
      }
    });
  });
});
```

---

## 🔄 Performance Regression Testing

### **Automated Bundle Size Monitoring**
```bash
#!/bin/bash
# scripts/performance/check-bundle-regression.sh

set -e

echo "🔍 Performance Regression Analysis Starting..."

# Build the application
echo "📦 Building application..."
npm run build

# Create performance baseline directory
mkdir -p .performance-baseline

# Get current bundle sizes
echo "📊 Analyzing bundle sizes..."
CURRENT_JS_SIZE=$(find .next/static/chunks -name "*.js" -exec du -bc {} + | tail -1 | cut -f1)
CURRENT_CSS_SIZE=$(find .next/static/css -name "*.css" -exec du -bc {} + | tail -1 | cut -f1)

# Get baseline sizes (stored in git)
BASELINE_JS_SIZE=$(cat .performance-baseline/js-size.txt 2>/dev/null || echo "0")
BASELINE_CSS_SIZE=$(cat .performance-baseline/css-size.txt 2>/dev/null || echo "0")

# Calculate changes
if [ "$BASELINE_JS_SIZE" -gt 0 ]; then
    JS_CHANGE=$(echo "scale=2; ($CURRENT_JS_SIZE - $BASELINE_JS_SIZE) / $BASELINE_JS_SIZE * 100" | bc -l)
else
    JS_CHANGE="N/A"
fi

if [ "$BASELINE_CSS_SIZE" -gt 0 ]; then
    CSS_CHANGE=$(echo "scale=2; ($CURRENT_CSS_SIZE - $BASELINE_CSS_SIZE) / $BASELINE_CSS_SIZE * 100" | bc -l)
else
    CSS_CHANGE="N/A"
fi

# Convert bytes to human readable
JS_SIZE_KB=$(echo "scale=1; $CURRENT_JS_SIZE / 1024" | bc -l)
CSS_SIZE_KB=$(echo "scale=1; $CURRENT_CSS_SIZE / 1024" | bc -l)

echo "📈 Bundle Size Analysis:"
echo "JavaScript: ${JS_SIZE_KB}KB (${JS_CHANGE}% change from baseline)"
echo "CSS: ${CSS_SIZE_KB}KB (${CSS_CHANGE}% change from baseline)"

# Performance budget validation
JS_BUDGET=512000  # 500KB
CSS_BUDGET=102400 # 100KB

BUDGET_VIOLATIONS=0

if [ "$CURRENT_JS_SIZE" -gt "$JS_BUDGET" ]; then
    echo "❌ JavaScript bundle exceeds budget (${JS_SIZE_KB}KB > 500KB)"
    BUDGET_VIOLATIONS=$((BUDGET_VIOLATIONS + 1))
else
    echo "✅ JavaScript bundle within budget (${JS_SIZE_KB}KB ≤ 500KB)"
fi

if [ "$CURRENT_CSS_SIZE" -gt "$CSS_BUDGET" ]; then
    echo "❌ CSS bundle exceeds budget (${CSS_SIZE_KB}KB > 100KB)"
    BUDGET_VIOLATIONS=$((BUDGET_VIOLATIONS + 1))
else
    echo "✅ CSS bundle within budget (${CSS_SIZE_KB}KB ≤ 100KB)"
fi

# Regression detection (>10% increase is significant)
REGRESSION_DETECTED=0

if [ "$JS_CHANGE" != "N/A" ] && [ $(echo "$JS_CHANGE > 10" | bc -l) -eq 1 ]; then
    echo "❌ JavaScript bundle size regression detected (+${JS_CHANGE}%)"
    REGRESSION_DETECTED=$((REGRESSION_DETECTED + 1))
fi

if [ "$CSS_CHANGE" != "N/A" ] && [ $(echo "$CSS_CHANGE > 10" | bc -l) -eq 1 ]; then
    echo "❌ CSS bundle size regression detected (+${CSS_CHANGE}%)"
    REGRESSION_DETECTED=$((REGRESSION_DETECTED + 1))
fi

# Generate detailed report
cat > .performance-baseline/latest-report.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "commit": "$(git rev-parse HEAD)",
  "bundles": {
    "javascript": {
      "size": $CURRENT_JS_SIZE,
      "sizeKB": $JS_SIZE_KB,
      "change": "$JS_CHANGE",
      "withinBudget": $([ "$CURRENT_JS_SIZE" -le "$JS_BUDGET" ] && echo "true" || echo "false")
    },
    "css": {
      "size": $CURRENT_CSS_SIZE,
      "sizeKB": $CSS_SIZE_KB,
      "change": "$CSS_CHANGE",
      "withinBudget": $([ "$CURRENT_CSS_SIZE" -le "$CSS_BUDGET" ] && echo "true" || echo "false")
    }
  },
  "budgets": {
    "javascript": $JS_BUDGET,
    "css": $CSS_BUDGET
  },
  "violations": $BUDGET_VIOLATIONS,
  "regressions": $REGRESSION_DETECTED
}
EOF

# Exit conditions
if [ $BUDGET_VIOLATIONS -gt 0 ] || [ $REGRESSION_DETECTED -gt 0 ]; then
    echo "❌ Performance regression detected"
    echo "📋 Review .performance-baseline/latest-report.json for details"
    exit 1
else
    echo "✅ Performance within acceptable limits"
    
    # Update baseline if this is a new record
    echo "$CURRENT_JS_SIZE" > .performance-baseline/js-size.txt
    echo "$CURRENT_CSS_SIZE" > .performance-baseline/css-size.txt
    
    echo "📊 Performance baseline updated"
fi
```

### **Continuous Integration Performance Pipeline**
**Configuration Block 1**:


---

## 🔗 Module Integration Network

### **Cross-Reference Intelligence**
- **[Main Hub](./monitoring-testing-protocols.md)** - Complete monitoring & testing overview
- **[Real-Time Core](./monitoring-testing-protocols-core.md)** - Performance monitoring infrastructure
- **[Analytics & Results](./monitoring-testing-protocols-analytics.md)** - Performance achievements and metrics
- **[Performance Hub](../strategies/PERFORMANCE_OPTIMIZATION.md)** - Complete performance optimization guide
- **[Bundle & Runtime Optimization](./bundle-runtime-optimization.md)** - Technical optimization implementations

### **Testing Technologies**
- **Lighthouse CI**: Automated performance auditing and regression detection
- **Playwright**: End-to-end performance testing framework
- **GitHub Actions**: Continuous integration and performance validation
- **Bundle Analysis**: Comprehensive size monitoring and regression detection
- **Custom Scripts**: Performance budget validation and reporting

---

**Quick Navigation**: [← Main Hub](./monitoring-testing-protocols.md) | [← Real-Time Core](./monitoring-testing-protocols-core.md) | [Analytics & Results →](./monitoring-testing-protocols-analytics.md)
