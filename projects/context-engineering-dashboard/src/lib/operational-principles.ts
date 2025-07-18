/**
 * Operational Principles Module
 * 
 * Contains principles focused on operational excellence, philosophical foundations, and cognitive optimization.
 * Categories: Operational Excellence (11), Philosophical Foundations (6), Cognitive Optimization (2)
 * Total: 19 principles
 */

import { DetailedPrinciple, PrincipleCategory } from './principles-types';

export const OPERATIONAL_PRINCIPLES: DetailedPrinciple[] = [
  // Philosophical Foundations (6 principles)
  {
    id: 1,
    name: 'meta-principle',
    title: 'Meta-Principle',
    definition: 'Stop trying to control the model. Enable it.',
    category: PrincipleCategory.PHILOSOPHICAL,
    categoryName: 'Philosophical Foundations',
    categoryEmoji: '🌟',
    slug: 'meta-principle',
    categorySlug: 'philosophical-foundations',
    implementation: [
      'Provide rich context',
      'Set measurable objectives',
      'Define verification targets', 
      'Allow autonomous iteration',
      'Get out of the way'
    ],
    crossReferences: [
      { principleId: 7, category: PrincipleCategory.OPERATIONAL, relationship: 'enables', description: 'enables Knowledge Discovery' },
      { principleId: 8, category: PrincipleCategory.OPERATIONAL, relationship: 'enables', description: 'enables Exploration-First' },
      { principleId: 5, category: PrincipleCategory.MATHEMATICAL, relationship: 'requires', description: 'quantified with Mathematical Auto-Activation' }
    ]
  },
  {
    id: 2,
    name: 'intelligence-as-natural',
    title: 'Intelligence as Natural Phenomenon', 
    definition: 'Intelligence emerges through evolution, not design.',
    category: PrincipleCategory.PHILOSOPHICAL,
    categoryName: 'Philosophical Foundations',
    categoryEmoji: '🌟',
    slug: 'intelligence-as-natural',
    categorySlug: 'philosophical-foundations',
    process: ['VARIATION → SELECTION → REPLICATION → EVOLUTION'],
    implementation: [
      'Try multiple approaches',
      'Keep what works',
      'Use repeatedly', 
      'Improve naturally'
    ],
    crossReferences: [
      { principleId: 14, category: PrincipleCategory.OPERATIONAL, relationship: 'enables', description: 'drives Pattern Recognition' },
      { principleId: 15, category: PrincipleCategory.OPERATIONAL, relationship: 'enables', description: 'drives Pattern Crystallization' }
    ]
  },
  {
    id: 3,
    name: 'context-over-commands',
    title: 'Context > Commands > Prompts',
    definition: 'Rich context enables autonomous excellence. Instead of precise rules, provide comprehensive context for AI to evolve toward measurable goals.',
    category: PrincipleCategory.PHILOSOPHICAL,
    categoryName: 'Philosophical Foundations', 
    categoryEmoji: '🌟',
    slug: 'context-over-commands',
    categorySlug: 'philosophical-foundations',
    implementation: [
      'Load complete project context via CLAUDE.md',
      'Provide domain-specific knowledge through modular loading',
      'Enable AI understanding of patterns and constraints',
      'Allow autonomous decision-making within context boundaries'
    ],
    crossReferences: [
      { principleId: 13, category: PrincipleCategory.OPERATIONAL, relationship: 'enables', description: 'powers Living Documentation' },
      { principleId: 20, category: PrincipleCategory.TECHNICAL, relationship: 'optimizes', description: 'optimizes with Context Economy' }
    ]
  },
  {
    id: 4,
    name: 'enable-dont-control',
    title: 'Enable, Don\'t Control',
    definition: 'Provide context and objectives, then allow autonomous execution.',
    category: PrincipleCategory.PHILOSOPHICAL,
    categoryName: 'Philosophical Foundations',
    categoryEmoji: '🌟', 
    slug: 'enable-dont-control',
    categorySlug: 'philosophical-foundations',
    protocol: [
      'Provide comprehensive context',
      'Define clear, measurable objectives',
      'Establish verification criteria',
      'Enable autonomous iteration',
      'Monitor without interference'
    ],
    crossReferences: [
      { principleId: 17, category: PrincipleCategory.TECHNICAL, relationship: 'enables', description: 'executes through Parallel > Sequential' },
      { principleId: 11, category: PrincipleCategory.VALIDATION, relationship: 'requires', description: 'requires Verification as Liberation' }
    ]
  },
  {
    id: 6,
    name: 'natural-language-commands',
    title: 'Natural Language Commands',
    definition: 'Commands should be in natural language, simple and effective, clear and concise, easy to understand for humans.',
    category: PrincipleCategory.PHILOSOPHICAL,
    categoryName: 'Philosophical Foundations',
    categoryEmoji: '🌟',
    slug: 'natural-language-commands', 
    categorySlug: 'philosophical-foundations',
    implementation: [
      'Human-Readable: All commands written in simple, clear language',
      'No Programming Complexity: Avoid JavaScript, complex logic, or technical abstractions',
      'Direct Instructions: Step-by-step guidance that Claude Code can follow naturally',
      'Accessible: Any human should be able to read and understand the command',
      'Effective Communication: Focus on clarity and actionability over technical sophistication'
    ],
    framework: [
      'Simplicity > Complexity: Choose the simpler approach every time',
      'Natural > Technical: Use conversational language over programming constructs', 
      'Clear > Clever: Prioritize understanding over sophistication',
      'Actionable > Abstract: Provide specific, executable guidance'
    ]
  },
  {
    id: 55,
    name: 'tool-call-execution-bridging',
    title: 'Tool Call Execution Bridging',
    definition: 'LLMs execute real work via tool calls, never simulate - with Task Agents for execution guarantee',
    category: PrincipleCategory.PHILOSOPHICAL,
    categoryName: 'Philosophical Foundations',
    categoryEmoji: '🌟',
    slug: 'tool-call-execution-bridging',
    categorySlug: 'philosophical-foundations',
    implementation: [
      'Tool Call Mandate: Use Bash, Read, Write, etc. for concrete actions',
      'Task Agent Priority: Deploy Task agents for complex command execution',
      'No Simulation: Execute real scripts, don\'t describe what they would do',
      'Real Results: Capture and report real outputs from tools',
      'Verification Through Action: Demonstrate functionality with real execution',
      'Bridge Specification-Implementation: Convert specifications into execution',
      'Agent Deployment Protocol: Use Task tool for guaranteed execution of complex workflows'
    ],
    automation: {
      autoActivation: true,
      triggers: ['complex-commands', 'multi-step-processes', 'claude-code-commands'],
      scriptIntegration: true
    },
    visualFormat: `╔═══════════════════════════════════════════════════════════╗
║                🎯 TOOL CALL EXECUTION ACTIVE              ║
╠═══════════════════════════════════════════════════════════╣
║ Mode: [DIRECT TOOL CALLS / TASK AGENT DEPLOYMENT]        ║
║ Agent Status: [INITIALIZING / EXECUTING / COMPLETED]     ║
║ Tool Calls Active: [count]                               ║
║ Real Actions: [VERIFIED ✅ / SIMULATED ❌]               ║
╚═══════════════════════════════════════════════════════════╝`
  },

  // Operational Excellence (11 principles)
  {
    id: 7,
    name: 'knowledge-discovery-hierarchy',
    title: 'Knowledge Discovery Hierarchy',
    definition: 'Systematic knowledge search: local → external, document for reuse.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'knowledge-discovery-hierarchy',
    categorySlug: 'operational-excellence',
    protocol: ['Codebase first → external research → document findings → reuse documented knowledge']
  },
  {
    id: 8,
    name: 'exploration-first-methodology',
    title: 'Exploration-First Methodology',
    definition: 'Mandatory exploration before execution ensures complete understanding.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'exploration-first-methodology', 
    categorySlug: 'operational-excellence',
    process: ['Context exploration → strategic analysis → granular planning → TDD execution → documentation']
  },
  {
    id: 9,
    name: 'test-driven-development',
    title: 'Test-Driven Development (TDD)',
    definition: 'Define verification criteria before implementation.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'test-driven-development',
    categorySlug: 'operational-excellence',
    protocol: ['Write tests → implement minimal solution → verify → refactor → document patterns']
  },
  {
    id: 10,
    name: 'objective-decomposition',
    title: 'Objective Decomposition',
    definition: 'Break large objectives into verifiable sub-objectives.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'objective-decomposition',
    categorySlug: 'operational-excellence',
    process: ['Identify objective → decompose measurably → create dependency tree → validate independently → synthesize']
  },
  {
    id: 13,
    name: 'living-documentation',
    title: 'Living Documentation', 
    definition: 'Documentation evolving through usage, consolidating knowledge.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'living-documentation',
    categorySlug: 'operational-excellence',
    process: ['Usage → Recognition → Documentation → Consolidation → Command → Evolution']
  },
  {
    id: 14,
    name: 'pattern-recognition',
    title: 'Pattern Recognition',
    definition: 'Identify reusable patterns for command crystallization.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'pattern-recognition',
    categorySlug: 'operational-excellence',
    process: ['Monitor workflows → document patterns → validate effectiveness → crystallize commands']
  },
  {
    id: 15,
    name: 'pattern-crystallization',
    title: 'Pattern Crystallization',
    definition: 'Transform repeated patterns (≥3 uses, ≥85% success) into reusable commands.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'pattern-crystallization',
    categorySlug: 'operational-excellence',
    process: ['Identify → document → validate → create → integrate'],
    thresholds: {
      minimumUses: 3,
      successRate: 0.85
    }
  },
  {
    id: 16,
    name: 'strategic-git-versioning',
    title: 'Strategic Git Versioning',
    definition: 'Version control as safety net and progress documentation.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'strategic-git-versioning',
    categorySlug: 'operational-excellence',
    protocol: ['Pre-process commit → checkpoint commits → post-process commit → milestone push → recovery points']
  },
  {
    id: 33,
    name: 'conversation-lifecycle-management',
    title: 'Conversation Lifecycle Management',
    definition: 'Execute work in conversation units with clear closure points.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'conversation-lifecycle-management',
    categorySlug: 'operational-excellence',
    protocol: ['Define scope → track progress → document state → create handoff → signal closure']
  },
  {
    id: 34,
    name: 'living-planning-documentation',
    title: 'Living Planning Documentation',
    definition: 'Document planning trees and execution paths for traceability and rollback.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'living-planning-documentation',
    categorySlug: 'operational-excellence',
    protocol: ['Capture planning trees → commit decision points → visualize paths → enable rollback → track evolution']
  },
  {
    id: 56,
    name: 'command-execution-transparency',
    title: 'Command Execution Transparency',
    definition: 'Every Claude Code slash command execution must be visibly announced by the main agent with bidirectional communication between Task agents and Principal agent.',
    category: PrincipleCategory.OPERATIONAL,
    categoryName: 'Operational Excellence',
    categoryEmoji: '⚙️',
    slug: 'command-execution-transparency',
    categorySlug: 'operational-excellence',
    implementation: [
      'Detection: Monitor `/command` execution',
      'Announcement: Main agent announces with context',
      'Deployment: Deploy Task agent with bidirectional communication',
      'Progress Reporting: Real-time status updates',
      'User Visibility: Display Task agent progress',
      'Handoff: Return control with results',
      'Error Handling: Surface failures with recovery',
      'Continuity: Maintain communication bridge'
    ],
    visualFormat: `╔═══════════════════════════════════════════════════════════╗
║                🎯 COMMAND EXECUTION                       ║
╠═══════════════════════════════════════════════════════════╣
║ Command: /[command-name] | Priority: [HIGH/MED/LOW]      ║
║ Purpose: [description] | Duration: [estimate]            ║
║ Context: [execution reason] | Agent: [DEPLOYING...]      ║
╚═══════════════════════════════════════════════════════════╝`
  },

  // Cognitive Optimization (2 principles)
  {
    id: 42,
    name: 'invisible-excellence',
    title: 'Invisible Excellence',
    definition: 'Architecture feels magical while remaining debuggable.',
    category: PrincipleCategory.COGNITIVE,
    categoryName: 'Cognitive Optimization',
    categoryEmoji: '🎯',
    slug: 'invisible-excellence',
    categorySlug: 'cognitive-optimization',
    framework: [
      'Predictability via patterns',
      'Power via composition',
      'Flexibility via orchestration',
      'Reliability via verification'
    ]
  },
  {
    id: 43,
    name: 'optimal-cognitive-organization',
    title: 'Optimal Cognitive Organization',
    definition: 'Information organized maximizing comprehension, minimizing cognitive friction.',
    category: PrincipleCategory.COGNITIVE,
    categoryName: 'Cognitive Optimization',
    categoryEmoji: '🎯',
    slug: 'optimal-cognitive-organization',
    categorySlug: 'cognitive-optimization',
    implementation: [
      'Logical Flow: Natural work sequence',
      'Thematic Grouping: Related concepts together',
      'Clear Navigation: Predictable structure',
      'Sequential Numbering: No gaps/interruptions',
      'Friction Reduction: Minimal mental effort'
    ],
    framework: [
      'Clarity > Completeness: Understanding over exhaustiveness',
      'Flow > Categorization: Natural workflow priority',
      'Accessibility > Sophistication: Access over complexity',
      'Coherence > Flexibility: Consistent structure'
    ]
  }
];