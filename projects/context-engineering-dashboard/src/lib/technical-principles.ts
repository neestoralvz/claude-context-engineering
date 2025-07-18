/**
 * Technical Principles Module
 * 
 * Contains principles focused on technical execution, mathematical rigor, and validation protocols.
 * Categories: Technical Standards (13), Mathematical Rigor (9), Validation Protocols (6)
 * Total: 28 principles
 */

import { DetailedPrinciple, PrincipleCategory } from './principles-types';

export const TECHNICAL_PRINCIPLES: DetailedPrinciple[] = [
  // Technical Standards (13 principles)
  {
    id: 17,
    name: 'parallel-over-sequential',
    title: 'Parallel > Sequential',
    definition: 'Execute multiple approaches simultaneously for faster exploration and better solutions.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'parallel-over-sequential',
    categorySlug: 'technical-standards',
    requirements: [
      'Mandatory Single-Message Execution: All parallel agents via simultaneous tool calls',
      'Dependency Analysis: Net Parallel Benefit ≥ 0.3',
      'Resource Optimization: Balance load across agents',
      'Synthesis Protocol: Consolidate parallel results'
    ],
    thresholds: {
      netParallelBenefit: 0.3
    }
  },
  {
    id: 18,
    name: 'multi-agent-orchestration',
    title: 'Multi-Agent Orchestration',
    definition: 'Deploy up to 10 parallel agents with specific contexts via Claude Code.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'multi-agent-orchestration',
    categorySlug: 'technical-standards',
    components: [
      'Single-message deployment (mandatory)',
      'Context-specific per agent',
      'Recursive sub-agent spawning',
      'Synthesis coordination',
      'Result consolidation'
    ],
    thresholds: {
      maxAgents: 10
    }
  },
  {
    id: 19,
    name: 'git-worktrees-parallel-development',
    title: 'Git Worktrees Parallel Development',
    definition: 'Use git worktrees for parallel exploration of multiple solutions.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'git-worktrees-parallel-development',
    categorySlug: 'technical-standards',
    protocol: [
      'Create worktree per approach',
      'Develop solutions simultaneously',
      'Compare results objectively',
      'Merge best elements',
      'Document pros/cons for each'
    ]
  },
  {
    id: 20,
    name: 'context-economy',
    title: 'Context Economy',
    definition: 'Minimize context while maintaining effectiveness.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'context-economy',
    categorySlug: 'technical-standards',
    protocol: [
      'Load only essential context',
      'Synthesize before handoff',
      'Prune redundant information',
      'Measure context efficiency',
      'Optimize continuously'
    ],
    thresholds: {
      contextReduction: 0.8,
      effectivenessTarget: 1.0
    }
  },
  {
    id: 21,
    name: 'dynamic-dependency-analysis',
    title: 'Dynamic Dependency Analysis',
    definition: 'Continuous re-evaluation of task dependencies during execution.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'dynamic-dependency-analysis',
    categorySlug: 'technical-standards',
    process: [
      'Initial dependency mapping',
      'Execute based on analysis',
      'Re-analyze after completions',
      'Adapt parallelization strategy',
      'Optimize execution order'
    ]
  },
  {
    id: 22,
    name: 'progressive-intelligence-framework',
    title: 'Progressive Intelligence Framework',
    definition: 'Deepen understanding through staged analysis.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'progressive-intelligence-framework',
    categorySlug: 'technical-standards',
    components: [
      'Contextual Understanding: Strategic analysis with exploration',
      'Strategic Implications: Risk and opportunity assessment',
      'Implementation Planning: Practical execution details',
      'Verification Strategy: Success criteria definition'
    ]
  },
  {
    id: 23,
    name: 'intelligence-orchestration',
    title: 'Intelligence Orchestration',
    definition: 'Coordinate specialized agents for complex challenges.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'intelligence-orchestration',
    categorySlug: 'technical-standards',
    implementation: [
      'Deploy domain-specific specialists',
      'Define clear handoff protocols',
      'Preserve context between agents',
      'Synthesize specialist outputs'
    ]
  },
  {
    id: 24,
    name: 'context-optimization',
    title: 'Context Optimization',
    definition: 'Load minimum necessary context while maintaining effectiveness.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'context-optimization',
    categorySlug: 'technical-standards',
    components: [
      'Essential context immediately',
      'Specialized context on-demand',
      'Lazy loading for performance',
      'Target: 80% reduction, 100% functionality'
    ],
    thresholds: {
      reductionTarget: 0.8,
      functionalityTarget: 1.0
    }
  },
  {
    id: 25,
    name: 'modular-composition',
    title: 'Modular Composition',
    definition: 'Build complexity through composition, not duplication.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'modular-composition',
    categorySlug: 'technical-standards',
    framework: [
      'Orchestrators USE modules',
      'Modules provide single capabilities',
      'Clear dependency mapping',
      'No functionality duplication'
    ]
  },
  {
    id: 26,
    name: 'single-source-of-truth',
    title: 'Single Source of Truth',
    definition: 'Each functionality has exactly one primary implementation.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'single-source-of-truth',
    categorySlug: 'technical-standards',
    framework: [
      'No duplication across commands',
      'Clear ownership of capabilities',
      'Modular composition over copying',
      'Centralized updates'
    ]
  },
  {
    id: 32,
    name: 'model-selection-intelligence',
    title: 'Model Selection Intelligence',
    definition: 'Select the optimal AI model based on task complexity and thinking requirements.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'model-selection-intelligence',
    categorySlug: 'technical-standards',
    implementation: [
      'Opus Selection: Deep analysis, strategic planning, architecture design',
      'Sonnet Selection: Implementation, simple tasks, repetitive work',
      'Automatic Suggestion: Decision Engine recommends based on complexity',
      'User Notification: Clear communication when model change beneficial',
      'Resource Optimization: Balance capability needs with efficiency'
    ]
  },
  {
    id: 35,
    name: 'organizational-architecture',
    title: 'Organizational Architecture',
    definition: 'Strict organization structure for scalable documentation growth.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'organizational-architecture',
    categorySlug: 'technical-standards',
    components: [
      '/docs/operations/outputs/[category]/[timestamp]-[topic].md',
      'Hierarchical organization by purpose',
      'No arbitrary file creation',
      'Clear naming conventions',
      'Predictable locations'
    ]
  },
  {
    id: 36,
    name: 'evolution-ready-architecture',
    title: 'Evolution-Ready Architecture',
    definition: 'System designed for unlimited growth and adaptation.',
    category: PrincipleCategory.TECHNICAL,
    categoryName: 'Technical Standards',
    categoryEmoji: '🔧',
    slug: 'evolution-ready-architecture',
    categorySlug: 'technical-standards',
    keyFeatures: [
      'Dynamic command discovery',
      'Automatic template compliance',
      'Pattern-based evolution',
      'Backward compatibility'
    ]
  },

  // Mathematical Rigor (9 principles)
  {
    id: 5,
    name: 'mathematical-auto-activation',
    title: 'Mathematical Auto-Activation',
    definition: 'Advanced intelligent systems require explicit activation of their superior capabilities, but this activation must be automatic and mathematically determined, not manual.',
    category: PrincipleCategory.MATHEMATICAL,
    categoryName: 'Mathematical Rigor',
    categoryEmoji: '🧮',
    slug: 'mathematical-auto-activation',
    categorySlug: 'mathematical-rigor',
    triggers: [
      'Complexity ≥ 1.0 → Auto-activate decision engine and advanced orchestration',
      'Net Parallel Benefit ≥ 0.3 → Auto-activate multi-agent orchestration',
      'Confidence < 0.7 → Auto-activate exploration-first methodology',
      'Objectives ≥ 3 → Auto-activate objective decomposition and dependency analysis',
      'Dependencies Detected → Auto-activate dynamic dependency optimization',
      'Pattern Matches ≥ 85% → Auto-activate pattern-based execution'
    ],
    thresholds: {
      complexity: 1.0,
      netParallelBenefit: 0.3,
      confidence: 0.7,
      objectives: 3,
      patternMatch: 0.85
    },
    automation: {
      autoActivation: true,
      triggers: ['complexity-threshold', 'parallel-benefit', 'low-confidence', 'multi-objective'],
      scriptIntegration: true
    }
  },
  {
    id: 27,
    name: 'decision-engine-layer-0',
    title: 'Decision Engine Layer 0',
    definition: 'Mandatory philosophy validation before execution.',
    category: PrincipleCategory.MATHEMATICAL,
    categoryName: 'Mathematical Rigor',
    categoryEmoji: '🧮',
    slug: 'decision-engine-layer-0',
    categorySlug: 'mathematical-rigor',
    components: [
      'Philosophy compliance',
      'Complexity thresholds',
      'Resource allocation',
      'Execution strategy'
    ]
  },
  {
    id: 28,
    name: 'explicit-decision-trees',
    title: 'Explicit Decision Trees',
    definition: 'Clear, documented decision flows for all routing with automatic mathematical triggers.',
    category: PrincipleCategory.MATHEMATICAL,
    categoryName: 'Mathematical Rigor',
    categoryEmoji: '🧮',
    slug: 'explicit-decision-trees',
    categorySlug: 'mathematical-rigor',
    components: [
      'Mathematical Auto-Triggers: Automatic evaluation of complexity, confidence, parallelization opportunities',
      'Binary Decision Points: Clear yes/no decisions based on calculated thresholds',
      'Documented Thresholds: All trigger values mathematically defined and enforced',
      'Fallback Strategies: Automatic recovery paths when triggers fail',
      'Visual Representation: Clear flowcharts showing decision paths and trigger conditions'
    ],
    automation: {
      autoActivation: true,
      triggers: ['task-intake', 'threshold-evaluation', 'capability-activation'],
      scriptIntegration: true
    }
  },
  {
    id: 29,
    name: 'confidence-based-routing',
    title: 'Confidence-Based Routing',
    definition: 'Automatically route execution based on real-time confidence score calculations.',
    category: PrincipleCategory.MATHEMATICAL,
    categoryName: 'Mathematical Rigor',
    categoryEmoji: '🧮',
    slug: 'confidence-based-routing',
    categorySlug: 'mathematical-rigor',
    thresholds: {
      'high-confidence': 0.9,
      'moderate-confidence': 0.7,
      'low-medium-confidence': 0.5,
      'low-confidence': 0.5
    },
    implementation: [
      '≥0.9: Direct command execution (high confidence, clear path)',
      '≥0.7: Multi-command coordination (moderate confidence, structured approach needed)',
      '≥0.5: Complex orchestration (low-medium confidence, comprehensive exploration required)',
      '<0.5: Task agent deployment (low confidence, specialist investigation needed)'
    ],
    formula: 'Confidence = (Pattern_Match * 0.3) + (Context_Clarity * 0.4) + (Objective_Specificity * 0.2) + (Domain_Familiarity * 0.1)'
  },
  {
    id: 30,
    name: 'confidence-scoring-engine',
    title: 'Confidence Scoring Engine',
    definition: 'Multi-dimensional quality measurement.',
    category: PrincipleCategory.MATHEMATICAL,
    categoryName: 'Mathematical Rigor',
    categoryEmoji: '🧮',
    slug: 'confidence-scoring-engine',
    categorySlug: 'mathematical-rigor',
    components: [
      'Functional: 30% tests, 25% integration, 20% errors, 25% coverage',
      'Visual: 40% UI consistency, 35% design, 25% accessibility',
      'Performance: 35% response, 30% efficiency, 20% throughput, 15% scale',
      'Behavioral: 40% stability, 30% error handling, 30% logging'
    ]
  },
  {
    id: 38,
    name: 'mathematical-verification',
    title: 'Mathematical Verification',
    definition: 'Objective metrics-based verification eliminating subjective assessment. Implemented through executable verification scripts achieving 100% test validation.',
    category: PrincipleCategory.MATHEMATICAL,
    categoryName: 'Mathematical Rigor',
    categoryEmoji: '🧮',
    slug: 'mathematical-verification',
    categorySlug: 'mathematical-rigor',
    automation: {
      autoActivation: true,
      scriptIntegration: true,
      triggers: ['verification-scripts', 'formula-validation', 'metrics-generation']
    },
    metrics: {
      successRate: 1.0,
      targetThreshold: 0.95,
      description: '22/22 mathematical formulas verified with 100% test validation'
    }
  },
  {
    id: 39,
    name: 'mathematical-verification-loops',
    title: 'Mathematical Verification Loops',
    definition: 'Recursive loops with mathematical precision toward objectives.',
    category: PrincipleCategory.MATHEMATICAL,
    categoryName: 'Mathematical Rigor',
    categoryEmoji: '🧮',
    slug: 'mathematical-verification-loops',
    categorySlug: 'mathematical-rigor',
    requirements: [
      'Measurable objectives (numeric)',
      'Progress metrics (percentage)',
      'Deviation detection (<5%)',
      'Auto-correction protocols',
      'Convergence guarantee'
    ]
  },
  {
    id: 40,
    name: 'threshold-enforcement',
    title: 'Threshold Enforcement',
    definition: 'Mathematical thresholds with automatic enforcement.',
    category: PrincipleCategory.MATHEMATICAL,
    categoryName: 'Mathematical Rigor',
    categoryEmoji: '🧮',
    slug: 'threshold-enforcement',
    categorySlug: 'mathematical-rigor',
    thresholds: {
      netParallelBenefit: 0.3,
      domainSeparation: 2.5,
      verificationROI: 2.0,
      patternCrystallization: 0.4,
      atomicComplexity: 1.0,
      moduleComplexity: 1.5,
      orchestratorComplexity: 2.0
    }
  },
  {
    id: 41,
    name: 'mathematical-simplicity',
    title: 'Mathematical Simplicity',
    definition: 'Enforce simplicity through mathematical measurement.',
    category: PrincipleCategory.MATHEMATICAL,
    categoryName: 'Mathematical Rigor',
    categoryEmoji: '🧮',
    slug: 'mathematical-simplicity',
    categorySlug: 'mathematical-rigor',
    formula: 'C = (S × F × D × R) / (A × P)',
    components: [
      'S: Size Factor',
      'F: Feature Density',
      'D: Dependency Factor',
      'R: Responsibility Factor',
      'A: Atomic Compliance',
      'P: Purpose Clarity'
    ]
  },

  // Validation Protocols (6 principles)
  {
    id: 11,
    name: 'verification-as-liberation',
    title: 'Verification as Liberation',
    definition: 'Give AI ability to "see" results through multiple verification types. Now implemented with executable scripts providing REAL multi-dimensional verification.',
    category: PrincipleCategory.VALIDATION,
    categoryName: 'Validation Protocols',
    categoryEmoji: '🔍',
    slug: 'verification-as-liberation',
    categorySlug: 'validation-protocols',
    components: [
      'Functional Sight: Automated tests (≥95% pass rate)',
      'Visual Sight: UI/UX validation (≥90% compliance)',
      'Performance Sight: Metrics and benchmarks (≤110% of targets)',
      'Behavioral Sight: Logs and user flows (≥85% success)',
      'Runtime Sight: Live system health validation'
    ],
    automation: {
      autoActivation: true,
      scriptIntegration: true,
      triggers: ['verification-scripts', 'system-integrity', 'multi-dimensional-sight']
    }
  },
  {
    id: 12,
    name: 'verification-loops',
    title: 'Verification Loops',
    definition: 'Iterative refinement cycles until objectives achieved. Now implemented with executable loops providing REAL iterative verification.',
    category: PrincipleCategory.VALIDATION,
    categoryName: 'Validation Protocols',
    categoryEmoji: '🔍',
    slug: 'verification-loops',
    categorySlug: 'validation-protocols',
    automation: {
      autoActivation: true,
      scriptIntegration: true,
      triggers: ['iteration-cycles', 'objective-verification', 'refinement-loops']
    },
    thresholds: {
      confidenceTarget: 8.5,
      maxIterations: 3
    }
  },
  {
    id: 31,
    name: 'intelligent-fallback',
    title: 'Intelligent Fallback',
    definition: 'Automatic recovery for all failure modes.',
    category: PrincipleCategory.VALIDATION,
    categoryName: 'Validation Protocols',
    categoryEmoji: '🔍',
    slug: 'intelligent-fallback',
    categorySlug: 'validation-protocols',
    components: [
      'Primary approach',
      'Secondary if primary fails',
      'Tertiary escalation',
      'Learn from fallback usage'
    ]
  },
  {
    id: 37,
    name: 'system-integrity-assurance',
    title: 'System Integrity Assurance',
    definition: 'Maintain system integrity automatically by verifying all project elements comply with established principles using existing mechanisms without adding complexity.',
    category: PrincipleCategory.VALIDATION,
    categoryName: 'Validation Protocols',
    categoryEmoji: '🔍',
    slug: 'system-integrity-assurance',
    categorySlug: 'validation-protocols',
    implementation: [
      'Leverage Existing Infrastructure: Use established metrics and verification systems',
      'Automated Compliance Checking: Verify commands, templates, and documentation meet thresholds',
      'Simple Remediation: Suggest specific commands to correct violations',
      'Pattern-Based Prevention: Document violation patterns to prevent recurrence'
    ]
  },
  {
    id: 48,
    name: 'adaptive-verification-framework',
    title: 'Adaptive Verification Framework',
    definition: 'Verification system defining dynamic success criteria based on request type, implementing multi-dimensional verification and iterative improvement protocols.',
    category: PrincipleCategory.VALIDATION,
    categoryName: 'Validation Protocols',
    categoryEmoji: '🔍',
    slug: 'adaptive-verification-framework',
    categorySlug: 'validation-protocols',
    components: [
      'Request-Type Success Criteria: Success criteria specific to each request type',
      'Multi-Layered Verification: Functional, quality, and process verification',
      'Iterative Improvement Protocol: Quality threshold monitoring with auto-restart triggers',
      'Knowledge Crystallization: Capture successful patterns and anti-patterns',
      'Dynamic Success Definition: Success criteria adapting to specific request context'
    ]
  },
  {
    id: 53,
    name: 'intelligent-error-recovery',
    title: 'Intelligent Error Recovery & Graceful Failure',
    definition: 'Sophisticated recovery system identifying specific failure modes, applying targeted recovery patterns, and maintaining graceful degradation.',
    category: PrincipleCategory.VALIDATION,
    categoryName: 'Validation Protocols',
    categoryEmoji: '🔍',
    slug: 'intelligent-error-recovery',
    categorySlug: 'validation-protocols',
    components: [
      'Specific Failure Modes: 4 types (thinking progression, plan generation, validation, comprehensive)',
      'Recovery Coordination: Targeted recovery patterns per failure type',
      'Graceful Degradation: Fallback strategies maintaining value',
      'Learning from Failures: Capture anti-patterns for prevention'
    ]
  }
];