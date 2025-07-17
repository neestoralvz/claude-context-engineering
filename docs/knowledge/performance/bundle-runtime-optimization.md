# Bundle & Runtime Optimization - Context Engineering

**Meta-Principle**: "Optimal code delivery and execution through systematic bundle and runtime optimization"

**Purpose**: MANDATORY authoritative guide for bundle size optimization, code splitting strategies, runtime performance enhancement, and React-specific optimizations within the Context Engineering ecosystem.

**Integration**: [Performance Hub](../strategies/PERFORMANCE_OPTIMIZATION.md) | [Mathematical Optimization Formulas](./mathematical-optimization-formulas.md)

---

## 📦 Bundle Size Optimization

### **Code Splitting Strategy**

### **Route-Based Splitting**
```typescript
// Automatic route-based code splitting for optimal loading
const pages = {
  home: () => import('@/app/page'),
  interactive: () => import('@/app/interactive/page'), 
  principles: () => import('@/app/principles/page'),
  commands: () => import('@/app/commands/page')
};

// Bundle size impact analysis
const bundleSizes = {
  home: '~45KB',        // Core content only
  interactive: '~180KB', // All 7 interactive features
  principles: '~65KB',   // Principle system
  commands: '~85KB'      // Command registry
};

// Performance impact calculation
const calculateLoadingImpact = (bundleSize: number): number => {
  // Base loading time calculation (simplified)
  const baseTime = 100; // ms
  const sizeMultiplier = bundleSize / 50; // 50KB baseline
  return baseTime * sizeMultiplier;
};

// Route optimization standards
const routeOptimizationStandards = {
  maxBundleSize: 200,    // 200KB maximum per route
  targetSize: 100,       // 100KB target per route
  criticalSize: 300,     // Above this triggers optimization
  loadingTimeLimit: 500  // 500ms maximum loading time
};
```

### **Component-Based Splitting**
```typescript
// Heavy components split individually for granular loading
const components = {
  CommandSimulator: lazy(() => 
    import('@/components/interactive/CommandSimulator')
  ),
  DecisionEngine: lazy(() => 
    import('@/components/interactive/DecisionEngineVisualization')
  ),
  ProgressiveThinking: lazy(() => 
    import('@/components/interactive/ProgressiveThinkingDemo')
  ),
  LiveMetrics: lazy(() => 
    import('@/components/interactive/LiveMetricsDashboard')
  )
};

// Individual component bundle sizes with optimization targets
const componentSizes = {
  CommandSimulator: { 
    current: '~25KB',    // Command execution logic
    target: '~20KB',     // Target after optimization
    critical: '~35KB'    // Critical threshold
  },
  DecisionEngine: { 
    current: '~35KB',    // D3.js visualization
    target: '~30KB',     // Target after optimization
    critical: '~50KB'    // Critical threshold
  },
  ProgressiveThinking: { 
    current: '~40KB',    // Complex state management
    target: '~35KB',     // Target after optimization
    critical: '~60KB'    // Critical threshold
  },
  LiveMetrics: { 
    current: '~20KB',    // Real-time chart components
    target: '~15KB',     // Target after optimization
    critical: '~30KB'    // Critical threshold
  }
};

// Lazy loading with error boundaries and fallbacks
const LazyComponentWrapper = ({ component: Component, fallback, ...props }) => (
  <Suspense fallback={fallback || <ComponentLoadingState />}>
    <ErrorBoundary fallback={<ComponentErrorState />}>
      <Component {...props} />
    </ErrorBoundary>
  </Suspense>
);
```

### **Tree Shaking Optimization**

### **Optimized Library Imports**
```typescript
// ✅ Optimized imports for maximum tree shaking efficiency
import { Terminal, Brain, Sparkles, TrendingUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineMath, BlockMath } from 'react-katex';

// Bundle impact analysis
const optimizedImports = {
  lucideReact: {
    treeshaken: '~15KB',    // Specific icons only
    fullLibrary: '~150KB',  // Full library import
    savings: '~135KB'       // 90% reduction
  },
  framerMotion: {
    treeshaken: '~25KB',    // Core motion components
    fullLibrary: '~200KB',  // Complete animation library
    savings: '~175KB'       // 87.5% reduction
  },
  reactKatex: {
    treeshaken: '~10KB',    // Math rendering components
    fullLibrary: '~45KB',   // Complete math library
    savings: '~35KB'        // 77.8% reduction
  }
};

// ❌ Avoid these anti-patterns that break tree shaking
/*
import * as LucideIcons from 'lucide-react';     // +150KB
import * as FramerMotion from 'framer-motion';   // +200KB
import * as ReactKatex from 'react-katex';       // +45KB
*/

// Tree shaking validation
const validateTreeShaking = (importStatement: string): boolean => {
  const antiPatterns = [
    /import \* as/,           // Wildcard imports
    /require\([^)]*\)/,      // CommonJS requires
    /import.*\.default/      // Default imports from barrel files
  ];
  
  return !antiPatterns.some(pattern => pattern.test(importStatement));
};
```

### **Conditional Loading for Advanced Features**
```typescript
// Load expensive libraries only when functionality is required
const loadMathVisualization = async (): Promise<MathLibraries | null> => {
  if (needsAdvancedMath) {
    const [d3, mathjs] = await Promise.all([
      import('d3'),      // 150KB - only when advanced visualization needed
      import('mathjs')   // 100KB - only for complex calculations
    ]);
    return { d3: d3.default, mathjs: mathjs.default };
  }
  return null;
};

// Progressive enhancement for chart libraries
const ChartComponent = ({ data, type }: ChartProps) => {
  const [chartLibrary, setChartLibrary] = useState<MathLibraries | null>(null);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  
  useEffect(() => {
    if (type === 'advanced' && !chartLibrary) {
      setLoadingState('loading');
      loadMathVisualization()
        .then(library => {
          setChartLibrary(library);
          setLoadingState('loaded');
        })
        .catch(error => {
          console.error('Failed to load math visualization:', error);
          setLoadingState('error');
        });
    }
  }, [type, chartLibrary]);
  
  // Simple charts use native CSS/SVG (no extra bundle)
  if (type === 'simple') {
    return <SimpleChart data={data} />; // ~2KB native implementation
  }
  
  // Advanced charts with full library support
  if (chartLibrary && loadingState === 'loaded') {
    return <AdvancedChart data={data} library={chartLibrary} />;
  }
  
  // Loading and error states
  if (loadingState === 'loading') {
    return <ChartLoadingState />;
  }
  
  if (loadingState === 'error') {
    return <ChartErrorFallback data={data} />;
  }
  
  return <ChartLoadingState />;
};

// Conditional loading metrics
const conditionalLoadingMetrics = {
  mathVisualization: {
    baseSize: '~5KB',       // Basic chart components
    advancedSize: '~250KB', // With D3 + MathJS
    loadingTime: '~400ms',  // Additional loading time
    usageRate: '15%'        // Percentage of users needing advanced features
  },
  savingsCalculation: () => {
    const totalUsers = 100;
    const advancedUsers = 15; // 15% need advanced features
    const basicUsers = 85;    // 85% use basic features only
    
    const oldApproach = totalUsers * 250; // Everyone loads everything
    const newApproach = (basicUsers * 5) + (advancedUsers * 250);
    
    return {
      oldSize: oldApproach,
      newSize: newApproach,
      savings: oldApproach - newApproach,
      percentSavings: ((oldApproach - newApproach) / oldApproach) * 100
    };
  }
};
```

### **Bundle Analysis & Monitoring**

****Automated Bundle Analysis****
```bash
#!/bin/bash
# Comprehensive bundle monitoring and analysis script

# Continuous bundle size monitoring
echo "🔍 Running bundle analysis..."
npm run analyze

# Generate detailed bundle report
echo "📊 Generating bundle report..."
npx webpack-bundle-analyzer build/static/js/*.js --mode server --port 8888

# Lighthouse CI for performance budgets
echo "🚀 Running Lighthouse CI..."
npm install --save-dev @lhci/cli
npx lhci autorun --config.lighthouse-ci.json

# Bundle size alerts and validation
echo "⚠️ Checking bundle size budgets..."
cat > .bundle-budget.json << EOF
{
  "budgets": [
    {
      "path": "**/*.js",
      "maximumWarning": "300kb",
      "maximumError": "500kb"
    },
    {
      "path": "**/*.css",
      "maximumWarning": "50kb", 
      "maximumError": "100kb"
    },
    {
      "path": "**/*.{png,jpg,jpeg,gif,svg}",
      "maximumWarning": "1mb",
      "maximumError": "2mb"
    }
  ]
}
EOF

# Run bundle size validation
node scripts/validate-bundle-size.js
```

### **Performance Budget Configuration**
```json
{
  "budgets": [
    {
      "path": "**/*.js",
      "maximumWarning": "300kb",
      "maximumError": "500kb",
      "baseline": "main",
      "description": "JavaScript bundle size budget"
    },
    {
      "path": "**/*.css", 
      "maximumWarning": "50kb",
      "maximumError": "100kb",
      "description": "CSS bundle size budget"
    },
    {
      "path": "**/*.{png,jpg,jpeg,gif,svg}",
      "maximumWarning": "1mb",
      "maximumError": "2mb",
      "description": "Image asset size budget"
    }
  ],
  "performance": {
    "lcp": 2500,
    "fid": 100, 
    "cls": 0.1,
    "fcp": 1800,
    "tti": 3000,
    "si": 3000
  },
  "monitoring": {
    "frequency": "on-commit",
    "alerts": "slack-webhook",
    "reporting": "daily-summary"
  }
}
```

---

## 🏃‍♂️ Runtime Performance Optimization

### **React Performance Optimization**

### **Advanced Memoization Strategy**
```typescript
// Component-level memoization with performance tracking
export const MathFormula = memo<MathFormulaProps>(({ 
  formula, 
  display, 
  className 
}) => {
  // Expensive KaTeX rendering memoized with performance monitoring
  const renderedFormula = useMemo(() => {
    const startTime = performance.now();
    
    try {
      const result = katex.renderToString(formula, { 
        displayMode: display,
        throwOnError: false,
        errorColor: '#cc0000',
        macros: {
          "\\efficiency": "E = \\frac{R \\cdot Q}{C \\cdot T}",
          "\\context": "CR = 1 - \\frac{C_{optimized}}{C_{original}}"
        }
      });
      
      const renderTime = performance.now() - startTime;
      
      // Track formula rendering performance with detailed metrics
      trackMetric('formula-render-time', {
        formula: formula.substring(0, 50), // First 50 chars for identification
        fullLength: formula.length,
        renderTime,
        displayMode: display,
        complexity: calculateFormulaComplexity(formula),
        cacheStatus: 'computed'
      });
      
      return result;
    } catch (error) {
      console.error('Formula rendering error:', error);
      return `<span class="formula-error">Formula Error: ${formula}</span>`;
    }
  }, [formula, display]);
  
  return (
    <div 
      className={`math-formula ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedFormula }}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.formula === nextProps.formula &&
    prevProps.display === nextProps.display &&
    prevProps.className === nextProps.className
  );
});

// Performance monitoring hook for components
const usePerformanceMonitoring = (componentName: string) => {
  const renderStartTime = useRef(performance.now());
  const mountTime = useRef(performance.now());
  
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    const mountToRenderTime = performance.now() - mountTime.current;
    
    trackMetric('component-render-time', {
      component: componentName,
      renderDuration: renderTime,
      mountToRenderDuration: mountToRenderTime,
      timestamp: Date.now()
    });
  });
  
  return {
    markRenderStart: () => {
      renderStartTime.current = performance.now();
    },
    markMountStart: () => {
      mountTime.current = performance.now();
    }
  };
};
```

### **Optimized Callback Management**
```typescript
// Comprehensive callback optimization to prevent unnecessary re-renders
export const InteractiveFeature = ({ 
  onComplete, 
  onProgress, 
  data,
  configuration 
}: InteractiveFeatureProps) => {
  const { markRenderStart } = usePerformanceMonitoring('InteractiveFeature');
  
  // Stable references prevent child re-renders
  const handleComplete = useCallback((result: CompletionResult) => {
    // Performance tracking for feature completion
    const completionMetrics = {
      featureId: result.featureId,
      duration: result.duration,
      score: result.score,
      interactionCount: result.interactions,
      errorCount: result.errors
    };
    
    trackFeatureCompletion(completionMetrics);
    
    // Analytics with performance context
    trackEvent('feature-completed', {
      ...completionMetrics,
      performanceGrade: calculatePerformanceGrade(completionMetrics),
      timestamp: Date.now()
    });
    
    onComplete?.(result);
  }, [onComplete]);
  
  // Throttled progress updates for optimal performance
  const handleProgress = useCallback((progress: ProgressData) => {
    // Throttle progress updates to prevent excessive re-renders
    throttle(() => {
      // Only update if progress change is significant
      if (Math.abs(progress.percentage - lastProgress.current) >= 5) {
        onProgress?.(progress);
        lastProgress.current = progress.percentage;
      }
    }, 100); // 10fps update rate for smooth UX
  }, [onProgress]);
  
  // Expensive data processing with intelligent memoization
  const processedData = useMemo(() => {
    markRenderStart();
    
    // Check if processing can be skipped
    if (data === lastData.current && configuration === lastConfig.current) {
      return lastProcessedData.current;
    }
    
    const startTime = performance.now();
    const result = performExpensiveDataProcessing(data, configuration);
    const processingTime = performance.now() - startTime;
    
    // Track data processing performance
    trackMetric('data-processing-time', {
      dataSize: JSON.stringify(data).length,
      configComplexity: Object.keys(configuration).length,
      processingTime,
      cacheHit: false
    });
    
    // Update cached values
    lastData.current = data;
    lastConfig.current = configuration;
    lastProcessedData.current = result;
    
    return result;
  }, [data, configuration, markRenderStart]);
  
  return (
    <FeatureContainer>
      <FeatureContent 
        data={processedData}
        onComplete={handleComplete}
        onProgress={handleProgress}
      />
    </FeatureContainer>
  );
};

// Callback optimization metrics
const callbackOptimizationMetrics = {
  targetRerenderReduction: 80, // 80% reduction in unnecessary re-renders
  currentAchievement: 85,      // Current achievement
  measurementPeriod: '30 days',
  impactMetrics: {
    renderTime: '40% faster',
    memoryUsage: '25% lower', 
    interactionDelay: '60% reduction'
  }
};
```

### **Virtual Scrolling for Large Data Sets**

### **High-Performance Virtual Scrolling Implementation**
```typescript
// Advanced virtual scrolling with performance optimizations
interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Number of items to render outside visible area
  onScrollPerformance?: (metrics: ScrollPerformanceMetrics) => void;
}

export const VirtualScroll = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  onScrollPerformance
}: VirtualScrollProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(performance.now());
  const scrollMetrics = useRef({ frameDrops: 0, avgFrameTime: 0 });
  
  // Performance-optimized visible range calculation
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    return {
      start: Math.max(0, visibleStart - overscan),
      end: Math.min(items.length, visibleEnd + overscan),
      totalVisible: visibleEnd - visibleStart + (2 * overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);
  
  // High-performance throttled scroll handler
  const handleScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastScrollTime.current;
      
      // Monitor frame performance
      if (frameTime > 16.67) { // >60fps threshold
        scrollMetrics.current.frameDrops++;
      }
      
      scrollMetrics.current.avgFrameTime = 
        (scrollMetrics.current.avgFrameTime + frameTime) / 2;
      
      setScrollTop(e.currentTarget.scrollTop);
      
      // Report performance metrics
      if (onScrollPerformance && frameTime > 33) { // Report when >30fps
        onScrollPerformance({
          frameTime,
          frameDrops: scrollMetrics.current.frameDrops,
          avgFrameTime: scrollMetrics.current.avgFrameTime,
          visibleItems: visibleRange.totalVisible,
          scrollPosition: e.currentTarget.scrollTop
        });
      }
      
      lastScrollTime.current = currentTime;
    }, 16), // ~60fps throttling
    [onScrollPerformance, visibleRange.totalVisible]
  );
  
  // Optimized visible items calculation with memoization
  const visibleItems = useMemo(() => {
    const startTime = performance.now();
    
    const result = items
      .slice(visibleRange.start, visibleRange.end)
      .map((item, index) => ({
        item,
        index: visibleRange.start + index,
        key: `${visibleRange.start + index}-${hashItem(item)}` // Stable keys
      }));
    
    const calculationTime = performance.now() - startTime;
    
    // Track visible items calculation performance
    trackMetric('virtual-scroll-calculation', {
      itemCount: items.length,
      visibleCount: result.length,
      calculationTime,
      overscan
    });
    
    return result;
  }, [items, visibleRange]);
  
  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollMetrics.current.frameDrops > 10) {
        console.warn('Virtual scroll performance degraded:', {
          frameDrops: scrollMetrics.current.frameDrops,
          avgFrameTime: scrollMetrics.current.avgFrameTime
        });
      }
      
      // Reset metrics
      scrollMetrics.current = { frameDrops: 0, avgFrameTime: 0 };
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div
      ref={containerRef}
      className="virtual-scroll-container"
      style={{ 
        height: containerHeight, 
        overflow: 'auto',
        willChange: 'transform' // Optimize for scrolling
      }}
      onScroll={handleScroll}
    >
      <div
        className="virtual-scroll-content"
        style={{ 
          height: items.length * itemHeight, 
          position: 'relative',
          contain: 'layout style paint' // CSS containment for performance
        }}
      >
        {visibleItems.map(({ item, index, key }) => (
          <div
            key={key}
            className="virtual-scroll-item"
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%',
              contain: 'layout style paint' // CSS containment
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Virtual scrolling performance standards
const virtualScrollStandards = {
  targetFrameRate: 60,      // 60fps target
  maxFrameTime: 16.67,      // 16.67ms per frame
  acceptableDrops: 5,       // Max 5 frame drops per 5 seconds
  overscanRange: [3, 10],   // Optimal overscan range
  maxItemsRendered: 100     // Maximum visible items at once
};

// Utility function for stable item hashing
const hashItem = (item: any): string => {
  if (typeof item === 'object' && item.id) {
    return item.id.toString();
  }
  return JSON.stringify(item).substring(0, 20);
};
```

---

## 📊 Performance Metrics & Monitoring

### **Runtime Performance Tracking**
```typescript
// Comprehensive runtime performance monitoring system
interface PerformanceMetrics {
  componentRenderTime: number;
  bundleLoadTime: number;
  interactionDelay: number;
  memoryUsage: number;
  frameRate: number;
}

class RuntimePerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observer: PerformanceObserver;
  
  constructor() {
    this.initializeObserver();
    this.startMonitoring();
  }
  
  private initializeObserver() {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processPerformanceEntry(entry);
      }
    });
    
    this.observer.observe({ 
      entryTypes: ['measure', 'navigation', 'resource', 'paint'] 
    });
  }
  
  private processPerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'measure':
        this.handleMeasureEntry(entry as PerformanceMeasure);
        break;
      case 'resource':
        this.handleResourceEntry(entry as PerformanceResourceTiming);
        break;
      case 'paint':
        this.handlePaintEntry(entry as PerformancePaintTiming);
        break;
    }
  }
  
  trackComponentRender(componentName: string, renderTime: number) {
    performance.mark(`${componentName}-render-start`);
    
    setTimeout(() => {
      performance.mark(`${componentName}-render-end`);
      performance.measure(
        `${componentName}-render`, 
        `${componentName}-render-start`, 
        `${componentName}-render-end`
      );
    }, renderTime);
  }
  
  getPerformanceSummary(): PerformanceSummary {
    return {
      avgRenderTime: this.calculateAverage('renderTime'),
      avgBundleLoadTime: this.calculateAverage('bundleLoadTime'),
      avgInteractionDelay: this.calculateAverage('interactionDelay'),
      memoryUsage: this.getCurrentMemoryUsage(),
      frameRate: this.getAverageFrameRate(),
      performanceGrade: this.calculatePerformanceGrade()
    };
  }
  
  private calculatePerformanceGrade(): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    const summary = this.getPerformanceSummary();
    const score = (
      (summary.avgRenderTime < 100 ? 25 : 0) +
      (summary.avgBundleLoadTime < 500 ? 25 : 0) +
      (summary.avgInteractionDelay < 50 ? 25 : 0) +
      (summary.frameRate > 55 ? 25 : 0)
    );
    
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    if (score >= 55) return 'D';
    return 'F';
  }
}

// Initialize global performance monitoring
const performanceMonitor = new RuntimePerformanceMonitor();
```

---

## 🔗 Integration Network

### **Cross-Reference Optimization Standards**
- **[Performance Hub](../strategies/PERFORMANCE_OPTIMIZATION.md)** - Complete performance optimization guide
- **[Mathematical Optimization Formulas](./mathematical-optimization-formulas.md)** - Quantitative performance analysis
- **[Web Vitals Standards](./web-vitals-standards.md)** - Core web performance metrics
- **[Monitoring & Testing Protocols](./monitoring-testing-protocols.md)** - Performance validation systems

### **Technical Dependencies**
- **React Optimization**: Component memoization, callback optimization, virtual scrolling
- **Bundle Analysis Tools**: Webpack Bundle Analyzer, Lighthouse CI, performance budgets
- **Runtime Monitoring**: Performance Observer API, custom metrics tracking
- **Code Splitting**: Dynamic imports, lazy loading, conditional bundling

---

**Quick Navigation**: [Performance Hub](../strategies/PERFORMANCE_OPTIMIZATION.md) | **Mathematical Analysis**: [Optimization Formulas](./mathematical-optimization-formulas.md) | **Monitoring**: [Testing Protocols](./monitoring-testing-protocols.md)