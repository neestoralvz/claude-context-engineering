# Context Engineering Technical Documentation

🔧 **Developer Reference Guide** - Comprehensive technical documentation for developers working with the Context Engineering web application architecture, implementation details, and advanced features.

## 📋 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Component System](#-component-system)
3. [Progressive Loading Implementation](#-progressive-loading-implementation)
4. [Mathematical Formula System](#-mathematical-formula-system)
5. [Interactive Features Architecture](#-interactive-features-architecture)
6. [State Management](#-state-management)
7. [Performance Optimization](#-performance-optimization)
8. [Testing Strategy](#-testing-strategy)
9. [Development Workflows](#-development-workflows)
10. [API Reference](#-api-reference)

---

## 🏗️ Architecture Overview

### System Design Philosophy

The Context Engineering application follows a modular, performance-optimized architecture based on three core principles:

1. **Progressive Enhancement**: Core functionality available without JavaScript, enhanced with interactive features
2. **Intelligent Loading**: Content loaded based on user needs and mathematical triggers
3. **Cognitive Optimization**: ≤3 cognitive steps to any destination

### Technology Stack

#### **Frontend Framework**
```typescript
// Next.js 14+ with App Router
{
  "framework": "Next.js 14.2.0",
  "router": "App Router",
  "rendering": "Static Site Generation (SSG)",
  "runtime": "Edge Runtime (Vercel)"
}
```

#### **Core Dependencies**
```json
{
  "react": "^18.3.0",
  "typescript": "^5.4.0",
  "tailwindcss": "^3.4.0",
  "framer-motion": "^11.2.0",
  "katex": "^0.16.10",
  "lucide-react": "^0.394.0"
}
```

#### **UI Component Libraries**
```json
{
  "@radix-ui/react-accordion": "^1.2.0",
  "@radix-ui/react-navigation-menu": "^1.2.0",
  "@radix-ui/react-progress": "^1.1.0",
  "@radix-ui/react-tabs": "^1.1.0",
  "@radix-ui/react-tooltip": "^1.1.1"
}
```

### Directory Structure

```
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Homepage implementation
│   ├── interactive/        # Interactive features app
│   ├── principles/         # Principles navigation
│   └── commands/           # Command system
├── components/
│   ├── core/               # Core philosophical components
│   ├── interactive/        # 7 interactive feature components
│   ├── layout/             # Navigation and layout
│   ├── providers/          # React context providers
│   ├── sections/           # Homepage sections
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility functions and data
└── types/                  # TypeScript type definitions
```

---

## 🧩 Component System

### Component Architecture

#### **Component Hierarchy**
```typescript
// Root Layout Structure
RootLayout
├── ThemeProvider          // Theme management
├── ProgressiveLoadingProvider  // Lazy loading logic
├── Navigation            // Main navigation
└── PageContent
    ├── Sections         // Homepage sections
    ├── Interactive      // Feature components
    └── Principles       // Principle displays
```

#### **Component Categories**

##### **1. Core Components** (`src/components/core/`)
```typescript
// PhilosophicalCore.tsx - Always-loaded foundational content
interface PhilosophicalCoreProps {
  autoLoad?: boolean;
  showMetrics?: boolean;
}

export const PhilosophicalCore: React.FC<PhilosophicalCoreProps> = ({
  autoLoad = true,
  showMetrics = false
}) => {
  // Permanent core context implementation
  // Meta-principle and cognitive framework
  // Evolution formula display
}
```

##### **2. Interactive Components** (`src/components/interactive/`)
```typescript
// Base interface for all interactive features
interface InteractiveFeatureProps {
  onComplete?: (data: any) => void;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  autoStart?: boolean;
}

// CommandSimulator.tsx
export const CommandSimulator: React.FC<InteractiveFeatureProps> = ({
  onComplete,
  difficulty = 'intermediate',
  autoStart = false
}) => {
  // Command execution simulation
  // Syntax highlighting and validation
  // Performance insights
}
```

##### **3. UI Components** (`src/components/ui/`)
```typescript
// Card.tsx - Base card component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'principle' | 'command';
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
}

// Badge.tsx - Status and category indicators
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

### Component Design Patterns

#### **Progressive Enhancement Pattern**
```typescript
// Example: CommandSimulator with progressive enhancement
const CommandSimulator = () => {
  const [isEnhanced, setIsEnhanced] = useState(false);
  
  useEffect(() => {
    // Enable enhanced features after hydration
    setIsEnhanced(true);
  }, []);
  
  return (
    <div>
      {/* Basic functionality - always available */}
      <BasicCommandInterface />
      
      {/* Enhanced features - progressively loaded */}
      {isEnhanced && (
        <Suspense fallback={<LoadingCard />}>
          <EnhancedCommandFeatures />
        </Suspense>
      )}
    </div>
  );
};
```

#### **Compound Component Pattern**
```typescript
// Interactive feature compound components
const InteractiveFeature = {
  Container: FeatureContainer,
  Header: FeatureHeader,
  Content: FeatureContent,
  Controls: FeatureControls,
  Metrics: FeatureMetrics
};

// Usage
<InteractiveFeature.Container>
  <InteractiveFeature.Header title="Command Simulator" />
  <InteractiveFeature.Content>
    <CommandInterface />
  </InteractiveFeature.Content>
  <InteractiveFeature.Controls>
    <ExecuteButton />
  </InteractiveFeature.Controls>
</InteractiveFeature.Container>
```

---

## ⚡ Progressive Loading Implementation

### Loading Strategy

#### **Context Loading Levels**
```typescript
// src/lib/progressive-loading.ts
export enum LoadingLevel {
  CORE = 0,      // ~0.8K tokens - Philosophical foundations
  STANDARD = 1,  // ~2.5K tokens - Command registry + auto-triggers
  DEEP = 2,      // ~5K tokens - Full command system + metrics
  COMPLETE = 3   // ~15K tokens - All documentation + analysis
}

export interface LoadingTrigger {
  condition: () => boolean;
  level: LoadingLevel;
  priority: number;
  description: string;
}
```

#### **Auto-Loading Triggers**
```typescript
// Mathematical triggers for intelligent loading
export const loadingTriggers: LoadingTrigger[] = [
  {
    condition: () => confidenceLevel < 0.5,
    level: LoadingLevel.STANDARD,
    priority: 1,
    description: "Load philosophical foundations for low confidence"
  },
  {
    condition: () => complexityRating >= 0.9,
    level: LoadingLevel.DEEP,
    priority: 2,
    description: "Activate progressive thinking for high complexity"
  },
  {
    condition: () => analysisRequired && confidenceLevel < 0.7,
    level: LoadingLevel.COMPLETE,
    priority: 3,
    description: "Deep strategic analysis required"
  }
];
```

### Progressive Loading Provider

```typescript
// src/components/providers/ProgressiveLoadingProvider.tsx
interface ProgressiveLoadingContextType {
  currentLevel: LoadingLevel;
  isLoading: boolean;
  loadContent: (level: LoadingLevel) => Promise<void>;
  checkTriggers: () => void;
}

export const ProgressiveLoadingProvider: React.FC<{children: React.ReactNode}> = ({
  children
}) => {
  const [currentLevel, setCurrentLevel] = useState(LoadingLevel.CORE);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedContent, setLoadedContent] = useState(new Set<LoadingLevel>());

  const loadContent = useCallback(async (level: LoadingLevel) => {
    if (loadedContent.has(level)) return;
    
    setIsLoading(true);
    try {
      // Dynamic import based on level
      switch (level) {
        case LoadingLevel.STANDARD:
          await import('@/lib/commands');
          await import('@/lib/principles');
          break;
        case LoadingLevel.DEEP:
          await import('@/components/interactive');
          break;
        case LoadingLevel.COMPLETE:
          await import('@/lib/full-system');
          break;
      }
      
      setLoadedContent(prev => new Set([...prev, level]));
      setCurrentLevel(Math.max(currentLevel, level));
    } finally {
      setIsLoading(false);
    }
  }, [currentLevel, loadedContent]);

  return (
    <ProgressiveLoadingContext.Provider value={{
      currentLevel,
      isLoading,
      loadContent,
      checkTriggers: () => evaluateLoadingTriggers(loadContent)
    }}>
      {children}
    </ProgressiveLoadingContext.Provider>
  );
};
```

---

## 📐 Mathematical Formula System

### KaTeX Integration

#### **Formula Component Architecture**
```typescript
// src/components/ui/MathFormula.tsx
interface MathFormulaProps {
  formula: string;
  display?: boolean;
  className?: string;
  description?: string;
  variables?: Record<string, string>;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  display = false,
  className,
  description,
  variables
}) => {
  return (
    <div className={`math-formula ${className}`}>
      <InlineMath math={formula} />
      {description && (
        <div className="formula-description">{description}</div>
      )}
      {variables && (
        <VariableDefinitions variables={variables} />
      )}
    </div>
  );
};
```

#### **Predefined Formulas**
```typescript
// src/lib/formulas.ts
export const ContextEngineeringFormulas = {
  EFFICIENCY: {
    latex: "E = \\frac{R \\cdot Q}{C \\cdot T}",
    description: "Context Engineering Efficiency Formula",
    variables: {
      "E": "Efficiency score",
      "R": "Results achieved",
      "Q": "Quality measure",
      "C": "Computational cost",
      "T": "Time invested"
    }
  },
  
  CONTEXT_REDUCTION: {
    latex: "CR = 1 - \\frac{C_{optimized}}{C_{original}}",
    description: "Context Reduction Ratio",
    variables: {
      "CR": "Context Reduction ratio (0-1)",
      "C_{optimized}": "Optimized context size",
      "C_{original}": "Original context size"
    }
  },
  
  NAVIGATION_OPTIMIZATION: {
    latex: "NO = \\frac{1}{\\text{avg}(steps)} \\cdot \\sum_{i=1}^{n} \\frac{1}{distance_i}",
    description: "Navigation Optimization Score",
    variables: {
      "NO": "Navigation optimization score",
      "steps": "Cognitive steps to destination",
      "distance_i": "Path distance for route i"
    }
  }
};
```

#### **Formula Rendering Optimization**
```typescript
// src/components/ui/PredefinedFormula.tsx
interface PredefinedFormulaProps {
  type: keyof typeof ContextEngineeringFormulas;
  showDescription?: boolean;
  showVariables?: boolean;
  interactive?: boolean;
}

export const PredefinedFormula: React.FC<PredefinedFormulaProps> = ({
  type,
  showDescription = true,
  showVariables = false,
  interactive = false
}) => {
  const formula = ContextEngineeringFormulas[type];
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      className="predefined-formula"
      whileHover={interactive ? { scale: 1.02 } : undefined}
    >
      <MathFormula 
        formula={formula.latex}
        display={true}
        description={showDescription ? formula.description : undefined}
      />
      
      {showVariables && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <VariableDefinitions variables={formula.variables} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {interactive && (
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Hide' : 'Show'} Variables
        </button>
      )}
    </motion.div>
  );
};
```

---

## 🎮 Interactive Features Architecture

### Feature Registration System

```typescript
// src/lib/interactive-features.ts
export interface InteractiveFeature {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<InteractiveFeatureProps>;
  category: 'core' | 'analytics' | 'learning' | 'exploration';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  keyFeatures: string[];
  dependencies?: string[];
  prerequisites?: string[];
}

export const INTERACTIVE_FEATURES: Record<string, InteractiveFeature> = {
  'command-simulator': {
    id: 'command-simulator',
    title: 'Command Simulator',
    description: 'Practice command execution with real-time preview and analysis',
    component: lazy(() => import('@/components/interactive/CommandSimulator')),
    category: 'core',
    difficulty: 'intermediate',
    estimatedTime: '10-20 min',
    keyFeatures: [
      'Real command execution flows',
      'Syntax highlighting',
      'Performance insights',
      'Interactive previews'
    ]
  },
  // ... other features
};
```

### Feature Component Base Class

```typescript
// src/components/interactive/base/InteractiveFeatureBase.tsx
export abstract class InteractiveFeatureBase<T = any> extends React.Component<
  InteractiveFeatureProps,
  T
> {
  protected abstract featureId: string;
  protected abstract title: string;
  
  // Analytics tracking
  protected trackEvent(eventName: string, data?: any) {
    if (typeof window !== 'undefined') {
      // Track feature usage
      console.log(`Feature: ${this.featureId}, Event: ${eventName}`, data);
    }
  }
  
  // Performance monitoring
  protected measurePerformance<R>(operation: string, fn: () => R): R {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    this.trackEvent('performance', {
      operation,
      duration,
      feature: this.featureId
    });
    
    return result;
  }
  
  // Error boundary integration
  protected handleError(error: Error, errorInfo: any) {
    this.trackEvent('error', {
      error: error.message,
      stack: error.stack,
      errorInfo
    });
  }
  
  // Lifecycle hooks
  componentDidMount() {
    this.trackEvent('feature_started');
  }
  
  componentWillUnmount() {
    this.trackEvent('feature_completed');
  }
}
```

### Command Simulator Implementation

```typescript
// src/components/interactive/CommandSimulator.tsx
interface CommandSimulatorState {
  currentCommand: string;
  executionHistory: CommandExecution[];
  isExecuting: boolean;
  syntaxValid: boolean;
  performanceMetrics: PerformanceMetrics;
}

export class CommandSimulator extends InteractiveFeatureBase<CommandSimulatorState> {
  protected featureId = 'command-simulator';
  protected title = 'Command Simulator';
  
  state: CommandSimulatorState = {
    currentCommand: '',
    executionHistory: [],
    isExecuting: false,
    syntaxValid: true,
    performanceMetrics: {
      averageExecutionTime: 0,
      successRate: 0,
      commandsExecuted: 0
    }
  };
  
  // Command validation with syntax highlighting
  private validateCommand(command: string): ValidationResult {
    return this.measurePerformance('command_validation', () => {
      const tokens = this.tokenizeCommand(command);
      const ast = this.parseTokens(tokens);
      return this.validateAST(ast);
    });
  }
  
  // Real-time execution simulation
  private async executeCommand(command: string): Promise<ExecutionResult> {
    this.setState({ isExecuting: true });
    
    try {
      return await this.measurePerformance('command_execution', async () => {
        // Simulate command processing
        const result = await this.processCommand(command);
        
        // Update execution history
        this.setState(prevState => ({
          executionHistory: [
            ...prevState.executionHistory,
            {
              command,
              result,
              timestamp: Date.now(),
              executionTime: result.executionTime
            }
          ]
        }));
        
        return result;
      });
    } finally {
      this.setState({ isExecuting: false });
    }
  }
  
  render() {
    return (
      <div className="command-simulator">
        <CommandInput
          value={this.state.currentCommand}
          onChange={this.handleCommandChange}
          onExecute={this.executeCommand}
          syntaxValid={this.state.syntaxValid}
        />
        
        <ExecutionPreview
          command={this.state.currentCommand}
          validation={this.validateCommand(this.state.currentCommand)}
        />
        
        <PerformanceMetrics
          metrics={this.state.performanceMetrics}
          realTime={true}
        />
        
        <ExecutionHistory
          history={this.state.executionHistory}
          maxItems={10}
        />
      </div>
    );
  }
}
```

---

## 🗂️ State Management

### Context-Based State Management

```typescript
// src/contexts/ApplicationContext.tsx
interface ApplicationState {
  theme: 'light' | 'dark' | 'system';
  navigationHistory: string[];
  userPreferences: UserPreferences;
  systemMetrics: SystemMetrics;
  loadingState: LoadingState;
}

interface ApplicationContextType {
  state: ApplicationState;
  dispatch: React.Dispatch<ApplicationAction>;
  // Navigation helpers
  navigateTo: (path: string) => void;
  goBack: () => void;
  // Theme helpers
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  // Metrics helpers
  updateMetrics: (metrics: Partial<SystemMetrics>) => void;
}

export const ApplicationProvider: React.FC<{children: React.ReactNode}> = ({
  children
}) => {
  const [state, dispatch] = useReducer(applicationReducer, initialState);
  
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    navigateTo: (path: string) => {
      dispatch({ type: 'NAVIGATE', payload: path });
      // Track navigation for metrics
      dispatch({ 
        type: 'UPDATE_METRICS', 
        payload: { 
          navigationCount: state.systemMetrics.navigationCount + 1 
        }
      });
    },
    // ... other helpers
  }), [state]);
  
  return (
    <ApplicationContext.Provider value={contextValue}>
      {children}
    </ApplicationContext.Provider>
  );
};
```

### Local State Management Patterns

```typescript
// Custom hooks for feature-specific state
export const useCommandSimulator = () => {
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentExecution, setCurrentExecution] = useState<CommandExecution | null>(null);
  
  const executeCommand = useCallback(async (command: string) => {
    const execution = await simulateCommandExecution(command);
    setCurrentExecution(execution);
    setCommands(prev => [...prev, execution.command]);
    return execution;
  }, []);
  
  return {
    commands,
    currentExecution,
    executeCommand,
    clearHistory: () => setCommands([]),
    isExecuting: currentExecution?.status === 'executing'
  };
};

// Performance state management
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(initialMetrics);
  
  const updateMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [key]: value,
      lastUpdated: Date.now()
    }));
  }, []);
  
  const calculateAverages = useCallback(() => {
    // Complex metrics calculations
    return {
      averageExecutionTime: metrics.totalExecutionTime / metrics.executionCount,
      successRate: (metrics.successfulExecutions / metrics.totalExecutions) * 100,
      contextEfficiency: (1 - metrics.optimizedContextSize / metrics.originalContextSize) * 100
    };
  }, [metrics]);
  
  return {
    metrics,
    updateMetric,
    averages: calculateAverages(),
    reset: () => setMetrics(initialMetrics)
  };
};
```

---

## ⚡ Performance Optimization

### Bundle Optimization Strategies

#### **Code Splitting Implementation**
```typescript
// Route-based code splitting
const InteractivePage = lazy(() => import('@/app/interactive/page'));
const PrinciplesPage = lazy(() => import('@/app/principles/page'));
const CommandsPage = lazy(() => import('@/app/commands/page'));

// Component-based code splitting
const CommandSimulator = lazy(() => 
  import('@/components/interactive/CommandSimulator').then(module => ({
    default: module.CommandSimulator
  }))
);

// Feature-based code splitting with loading states
const LazyInteractiveFeature: React.FC<{featureId: string}> = ({ featureId }) => {
  const FeatureComponent = lazy(() => 
    import(`@/components/interactive/${featureId}`).catch(() => 
      import('@/components/interactive/FeatureNotFound')
    )
  );
  
  return (
    <Suspense fallback={<FeatureLoadingState featureId={featureId} />}>
      <FeatureComponent />
    </Suspense>
  );
};
```

#### **Tree Shaking Optimization**
```typescript
// Optimized imports to enable tree shaking
import { Terminal, Brain, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineMath, BlockMath } from 'react-katex';

// Avoid importing entire libraries
// ❌ import * as LucideIcons from 'lucide-react';
// ✅ import { Terminal, Brain } from 'lucide-react';

// Dynamic imports for large dependencies
const loadMathJax = () => import('mathjax').then(module => module.default);
const loadD3 = () => import('d3').then(module => module.default);
```

### React Performance Optimization

#### **Memoization Strategies**
```typescript
// Component memoization
export const MathFormula = React.memo<MathFormulaProps>(({ 
  formula, 
  display, 
  className 
}) => {
  const renderedFormula = useMemo(() => 
    katex.renderToString(formula, { displayMode: display }),
    [formula, display]
  );
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: renderedFormula }}
    />
  );
});

// Expensive computation memoization
export const useOptimizedMetrics = (rawMetrics: RawMetrics) => {
  return useMemo(() => {
    // Expensive calculations only when rawMetrics change
    return {
      efficiency: calculateEfficiency(rawMetrics),
      contextReduction: calculateContextReduction(rawMetrics),
      navigationOptimization: calculateNavigationOptimization(rawMetrics)
    };
  }, [rawMetrics]);
};

// Callback memoization
export const InteractiveFeature: React.FC<Props> = ({ onComplete, data }) => {
  const handleComplete = useCallback((result: any) => {
    // Analytics tracking
    trackFeatureCompletion(result);
    // Parent callback
    onComplete?.(result);
  }, [onComplete]);
  
  const processData = useCallback((input: any) => {
    return expensiveDataProcessing(input);
  }, []);
  
  return <FeatureContent onComplete={handleComplete} processor={processData} />;
};
```

#### **Virtual Scrolling for Large Lists**
```typescript
// src/components/ui/VirtualizedList.tsx
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export const VirtualizedList = <T,>({ 
  items, 
  itemHeight, 
  containerHeight,
  renderItem 
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(visibleStart, visibleEnd).map((item, index) => ({
      item,
      index: visibleStart + index
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🧪 Testing Strategy

### Component Testing

```typescript
// src/__tests__/components/MathFormula.test.tsx
import { render, screen } from '@testing-library/react';
import { MathFormula } from '@/components/ui/MathFormula';

describe('MathFormula', () => {
  it('renders inline formulas correctly', () => {
    render(<MathFormula formula="E = mc^2" />);
    
    expect(screen.getByText(/E = mc/)).toBeInTheDocument();
  });
  
  it('renders display formulas correctly', () => {
    render(
      <MathFormula 
        formula="\\frac{R \\cdot Q}{C \\cdot T}" 
        display={true} 
      />
    );
    
    const formulaElement = screen.getByRole('math');
    expect(formulaElement).toHaveClass('katex-display');
  });
  
  it('handles invalid formulas gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    render(<MathFormula formula="\\invalid{formula" />);
    
    expect(screen.getByText(/Formula Error/)).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
```

### Interactive Feature Testing

```typescript
// src/__tests__/components/CommandSimulator.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommandSimulator } from '@/components/interactive/CommandSimulator';

describe('CommandSimulator', () => {
  it('validates command syntax in real-time', async () => {
    render(<CommandSimulator />);
    
    const input = screen.getByRole('textbox', { name: /command input/i });
    
    // Valid command
    fireEvent.change(input, { target: { value: '/context-eng' } });
    await waitFor(() => {
      expect(screen.getByText(/valid syntax/i)).toBeInTheDocument();
    });
    
    // Invalid command
    fireEvent.change(input, { target: { value: '/invalid-command' } });
    await waitFor(() => {
      expect(screen.getByText(/unknown command/i)).toBeInTheDocument();
    });
  });
  
  it('executes commands and shows results', async () => {
    render(<CommandSimulator />);
    
    const input = screen.getByRole('textbox', { name: /command input/i });
    const executeButton = screen.getByRole('button', { name: /execute/i });
    
    fireEvent.change(input, { target: { value: '/decision' } });
    fireEvent.click(executeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/command executed successfully/i)).toBeInTheDocument();
    });
  });
});
```

### Performance Testing

```typescript
// src/__tests__/performance/loading.test.ts
describe('Progressive Loading Performance', () => {
  it('loads core content within performance budget', async () => {
    const startTime = performance.now();
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/philosophical foundations/i)).toBeInTheDocument();
    });
    
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(1000); // 1 second budget
  });
  
  it('lazy loads interactive features efficiently', async () => {
    render(<InteractivePage />);
    
    const featureCard = screen.getByText(/command simulator/i);
    const startTime = performance.now();
    
    fireEvent.click(featureCard);
    
    await waitFor(() => {
      expect(screen.getByText(/practice command execution/i)).toBeInTheDocument();
    });
    
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // 2 second budget for interactive features
  });
});
```

---

## 🔄 Development Workflows

### Local Development Setup

```bash
# Development environment setup
npm install
npm run dev

# Type checking in watch mode
npm run type-check -- --watch

# Linting with auto-fix
npm run lint -- --fix

# Bundle analysis
ANALYZE=true npm run build
```

### Git Workflow

```bash
# Feature development workflow
git checkout -b feature/new-interactive-feature
git add .
git commit -m "feat: add new interactive feature with performance optimization"
git push origin feature/new-interactive-feature

# Create pull request with comprehensive description
gh pr create --title "Add Progressive Thinking Interactive Demo" \
  --body "## Summary
- Implement 4-stage progressive thinking demonstration
- Add mathematical visualization components
- Optimize for performance with lazy loading

## Technical Details
- New component: ProgressiveThinkingDemo
- Performance optimizations: Code splitting, memoization
- Test coverage: 95%+ for new components

## Testing
- [ ] All interactive features functional
- [ ] Performance budget maintained
- [ ] Accessibility compliance verified"
```

### Code Review Guidelines

#### **Pull Request Checklist**
- [ ] **Performance**: Bundle size impact analyzed
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified
- [ ] **Testing**: Comprehensive test coverage (>90%)
- [ ] **Documentation**: Component documentation updated
- [ ] **TypeScript**: Strict typing maintained
- [ ] **Design System**: Consistent with existing patterns

#### **Code Quality Standards**
```typescript
// ✅ Good: Proper TypeScript typing
interface Props {
  title: string;
  onComplete?: (data: CompletionData) => void;
  variant?: 'default' | 'enhanced';
}

// ✅ Good: Performance-optimized component
const ExpensiveComponent = memo(({ data }: Props) => {
  const processedData = useMemo(() => 
    expensiveCalculation(data), [data]
  );
  
  return <div>{processedData}</div>;
});

// ❌ Avoid: Untyped props and inefficient rendering
const BadComponent = ({ title, onComplete, data }) => {
  const processedData = expensiveCalculation(data); // Runs every render
  return <div>{processedData}</div>;
};
```

---

## 📚 API Reference

### Core Hooks

#### **useProgressiveLoading**
```typescript
const {
  currentLevel,
  isLoading,
  loadContent,
  checkTriggers
} = useProgressiveLoading();

// Load specific content level
await loadContent(LoadingLevel.DEEP);

// Check mathematical triggers
checkTriggers();
```

#### **usePerformanceMetrics**
```typescript
const {
  metrics,
  updateMetric,
  averages,
  reset
} = usePerformanceMetrics();

// Update specific metric
updateMetric('executionTime', 150);

// Get calculated averages
const { successRate, contextEfficiency } = averages;
```

#### **useInteractiveFeature**
```typescript
const {
  isActive,
  progress,
  complete,
  restart
} = useInteractiveFeature(featureId);

// Complete feature with data
complete({ score: 95, insights: ['insight1', 'insight2'] });
```

### Component APIs

#### **MathFormula**
```typescript
interface MathFormulaProps {
  formula: string;           // LaTeX formula string
  display?: boolean;         // Inline (false) or display (true) mode
  className?: string;        // Additional CSS classes
  description?: string;      // Optional formula description
  variables?: Record<string, string>; // Variable definitions
}
```

#### **InteractiveFeature**
```typescript
interface InteractiveFeatureProps {
  onComplete?: (data: any) => void;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  autoStart?: boolean;
  showProgress?: boolean;
}
```

#### **Card**
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'principle' | 'command';
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
  children: React.ReactNode;
}
```

### Utility Functions

#### **Performance Utilities**
```typescript
// Measure function execution time
const result = measurePerformance('operation-name', () => {
  return expensiveOperation();
});

// Track user interactions
trackEvent('feature-interaction', {
  feature: 'command-simulator',
  action: 'execute-command',
  success: true
});

// Calculate efficiency metrics
const efficiency = calculateEfficiency({
  results: 85,
  quality: 0.92,
  cost: 150,
  time: 1200
});
```

#### **Navigation Utilities**
```typescript
// Cognitive step calculation
const steps = calculateCognitiveSteps(fromPath, toPath);

// Navigation optimization
const optimizedPath = optimizeNavigationPath(start, end, constraints);

// Breadcrumb generation
const breadcrumbs = generateBreadcrumbs(currentPath);
```

---

## 🔗 Integration Points

### External Service Integration

#### **Analytics Integration**
```typescript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

// Custom event tracking
export const trackFeatureUsage = (featureId: string, data: any) => {
  if (typeof window !== 'undefined') {
    // Vercel Analytics
    window.va?.track('feature-usage', { feature: featureId, ...data });
    
    // Custom analytics
    analytics.track('ContextEngineering.FeatureUsage', {
      featureId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ...data
    });
  }
};
```

#### **Performance Monitoring**
```typescript
// Web Vitals integration
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export const initializePerformanceMonitoring = () => {
  const sendToAnalytics = (metric: any) => {
    analytics.track('ContextEngineering.WebVital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType
    });
  };

  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
};
```

### MCP Server Integration

```typescript
// Context7 integration for advanced users
export const initializeMCPIntegration = async () => {
  try {
    const mcp = await import('@context7/client');
    
    const client = new mcp.Client({
      serverUrl: process.env.NEXT_PUBLIC_CONTEXT7_SERVER,
      apiKey: process.env.CONTEXT7_API_KEY
    });
    
    return {
      searchDocumentation: (query: string) => 
        client.search({ query, type: 'documentation' }),
      
      resolveLibrary: (libraryName: string) =>
        client.resolveLibrary({ name: libraryName }),
      
      getLibraryDocs: (libraryId: string, topic?: string) =>
        client.getLibraryDocs({ libraryId, topic })
    };
  } catch (error) {
    console.warn('MCP integration not available:', error);
    return null;
  }
};
```

---

This technical documentation provides comprehensive coverage of the Context Engineering web application's architecture, implementation details, and development workflows. It serves as a complete reference for developers working with or extending the system.

For implementation examples and detailed code samples, refer to the actual source files in the repository. For user-facing documentation, see the USER_GUIDE.md and README.md files.