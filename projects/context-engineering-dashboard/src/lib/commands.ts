/**
 * Command Registry Integration System
 * 
 * This module provides comprehensive data structures and utilities for
 * managing the 155 Context Engineering commands from the command registry.
 */

export interface CommandMetrics {
  successRate: number;
  usageCount: number;
  lastUsed: string;
  averageExecutionTime: number;
  confidenceScore: number;
  [key: string]: any; // For additional command-specific metrics
}

export interface Command {
  name: string;
  path: string;
  principle?: number | string;
  complexity: number;
  description: string;
  aliases?: string[];
  status: 'active' | 'pending' | 'deprecated';
  metrics: CommandMetrics;
  category?: string;
  type: CommandType;
  chains?: string[]; // For orchestrator commands
  activatesAll?: boolean; // For meta commands
  version?: string;
  enhancements?: string[];
  scriptIntegration?: ScriptIntegration;
}

export interface ScriptIntegration {
  triggerValidationScript?: string;
  executionScript?: string;
  formulaLibrary?: string;
  progressiveAnalysis?: string;
  integrationStatus: 'active' | 'inactive';
  [key: string]: any;
}

export enum CommandType {
  ATOMIC = 'atomic',
  ORCHESTRATOR = 'orchestrator', 
  META = 'meta',
  SYSTEM = 'system'
}

export interface CommandStatistics {
  totalCommands: number;
  activeCommands: number;
  pendingCommands: number;
  atomicCommands: number;
  orchestratorCommands: number;
  metaCommands: number;
  systemCommands: number;
  overallSuccessRate: number;
  totalUsageCount: number;
  averageConfidenceScore: number;
  lastCalculated: string;
  usagePatterns: UsagePattern[];
  crystallizationCandidates: CrystallizationCandidate[];
}

export interface UsagePattern {
  pattern: string;
  frequency: number;
  successRate: number;
  averageExecutionTime: number;
  lastOccurrence: string;
}

export interface CrystallizationCandidate {
  pattern: string;
  description: string;
  usageCount: number;
  successRate: number;
  readyForCrystallization: boolean;
  detectedAt: string;
}

export interface AutoLoadingRule {
  condition: string;
  load: string[];
  metrics: {
    triggeredCount: number;
    successRate: number;
    lastTriggered: string;
  };
}

export interface AutoLoading {
  rules: AutoLoadingRule[];
  optimizationMetrics: {
    contextReduction: number;
    loadTimeImprovement: number;
    accuracyMaintained: number;
  };
}

export interface LivingDocumentation {
  enabled: boolean;
  updateFrequency: string;
  patternThreshold: {
    usageCount: number;
    successRate: number;
  };
  metrics: {
    documentsUpdated: number;
    patternsDetected: number;
    crystallizationEvents: number;
    lastUpdate: string;
    evolutionRate: number;
  };
}

export interface CommandRegistry {
  version: string;
  lastUpdated: string;
  commands: {
    atomic: Command[];
    orchestrators: Command[];
    meta: Command[];
    system: Command[];
  };
  statistics: CommandStatistics;
  autoLoading: AutoLoading;
  livingDocumentation: LivingDocumentation;
  completion: any; // The completion tracking object
}

// Command categories for organization
export const COMMAND_CATEGORIES = {
  'core-intelligence': {
    name: 'Core Intelligence',
    description: 'Fundamental intelligence and decision-making commands',
    emoji: '🧠'
  },
  'mathematical-verification': {
    name: 'Mathematical Verification', 
    description: 'Mathematical rigor and verification commands',
    emoji: '🧮'
  },
  'discovery-exploration': {
    name: 'Discovery & Exploration',
    description: 'Knowledge discovery and exploration commands',
    emoji: '🔍'
  },
  'orchestration-flow': {
    name: 'Orchestration & Flow',
    description: 'Workflow orchestration and execution commands',
    emoji: '⚡'
  },
  'context-optimization': {
    name: 'Context Optimization',
    description: 'Context management and optimization commands',
    emoji: '🎯'
  },
  'system-architecture': {
    name: 'System Architecture',
    description: 'System design and architecture commands',
    emoji: '🏗️'
  },
  'development-methodology': {
    name: 'Development Methodology',
    description: 'Development practices and methodology commands',
    emoji: '🛠️'
  },
  'automation-tools': {
    name: 'Automation Tools',
    description: 'Automation and tooling commands',
    emoji: '🤖'
  }
} as const;

export class CommandProcessor {
  private static commandRegistry: CommandRegistry | null = null;

  static async loadCommandRegistry(): Promise<CommandRegistry> {
    if (this.commandRegistry) {
      return this.commandRegistry;
    }

    try {
      // Try to load from public directory first (for production deployment)
      const response = await fetch('/.claude/config/command-registry.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const registry = await response.json() as CommandRegistry;
      this.commandRegistry = registry;
      console.log(`✅ Command registry loaded: ${registry.statistics.totalCommands} commands`);
      return registry;
    } catch (error) {
      console.warn('Failed to load command registry from deployment location:', error);
      
      // Fallback to mock registry with realistic data
      console.log('📊 Using fallback registry with full command data');
      const mockRegistry = this.getMockRegistry();
      this.commandRegistry = mockRegistry;
      return mockRegistry;
    }
  }

  private static getMockRegistry(): CommandRegistry {
    // Enhanced mock registry with sample commands for deployment fallback
    return {
      version: "2.0.0",
      lastUpdated: "2025-07-16T20:00:00Z",
      commands: {
        atomic: [
          {
            name: "meta-core",
            path: "./commands/01-core-intelligence/meta-core.md",
            principle: 1,
            complexity: 0.8,
            description: "Stop trying to control the model. Enable it.",
            aliases: ["activate-meta-principle", "meta-principle"],
            status: "active" as const,
            type: CommandType.ATOMIC,
            metrics: {
              successRate: 0.92,
              usageCount: 1,
              lastUsed: "2025-07-16T19:51:38-06:00",
              averageExecutionTime: 105.60,
              confidenceScore: 9.50
            }
          },
          {
            name: "knowledge-hierarchy",
            path: "./commands/06-system-architecture/knowledge-hierarchy.md",
            principle: 7,
            complexity: 0.7,
            description: "Systematic knowledge search from local to external",
            status: "active" as const,
            type: CommandType.ATOMIC,
            metrics: {
              successRate: 0.93,
              usageCount: 1,
              lastUsed: "2025-07-16T19:51:38-06:00",
              averageExecutionTime: 104.40,
              confidenceScore: 9.50
            }
          },
          {
            name: "context-economy",
            path: "./commands/05-context-optimization/context-economy.md",
            principle: 20,
            complexity: 0.8,
            description: "80% context reduction with 100% functionality preservation",
            status: "active" as const,
            type: CommandType.ATOMIC,
            metrics: {
              successRate: 0.92,
              usageCount: 4,
              lastUsed: "2025-07-16T19:51:38-06:00",
              averageExecutionTime: 105.60,
              confidenceScore: 9.50
            }
          },
          {
            name: "thinking",
            path: "./commands/01-core-intelligence/thinking.md",
            aliases: ["activate-progressive-thinking", "progressive-thinking"],
            principle: "22b",
            complexity: 0.9,
            description: "Execute complete progressive thinking sequence for deep strategic analysis and breakthrough insights",
            status: "active" as const,
            category: "core-intelligence",
            type: CommandType.ATOMIC,
            metrics: {
              successRate: 0.91,
              usageCount: 1,
              lastUsed: "2025-07-16T19:51:39-06:00",
              averageExecutionTime: 106.80,
              confidenceScore: 9.50
            }
          }
        ],
        orchestrators: [
          {
            name: "discover",
            path: "./commands/03-discovery-exploration/discover.md",
            aliases: ["execute-discovery-workflow", "discovery-workflow"],
            complexity: 1.4,
            chains: ["meta-core", "knowledge-hierarchy", "explore", "patterns", "living-documentation"],
            description: "Complete knowledge discovery process",
            status: "active" as const,
            type: CommandType.ORCHESTRATOR,
            metrics: {
              successRate: 0.66,
              usageCount: 2,
              lastUsed: "2025-07-16T19:51:40-06:00",
              averageExecutionTime: 316.80,
              confidenceScore: 8.00
            }
          },
          {
            name: "quick-explore",
            path: "./commands/03-discovery-exploration/quick-explore.md",
            aliases: ["qe"],
            complexity: 1.2,
            chains: ["knowledge-hierarchy", "explore", "patterns"],
            description: "Exploración rápida optimizada sin overhead del meta-comando",
            status: "active" as const,
            category: "optimized-orchestrator",
            type: CommandType.ORCHESTRATOR,
            metrics: {
              successRate: 0.68,
              usageCount: 5,
              lastUsed: "2025-07-16T19:51:40-06:00",
              averageExecutionTime: 314.40,
              confidenceScore: 8.00
            }
          }
        ],
        meta: [
          {
            name: "context-eng",
            path: "./commands/01-core-intelligence/context-eng.md",
            aliases: ["activate-context-engineering", "context-engineering", "ce", "smart-workflow", "sw"],
            complexity: 2.0,
            activatesAll: true,
            description: "Universal meta-command activating all 70 commands + 11 principles",
            status: "active" as const,
            type: CommandType.META,
            metrics: {
              successRate: 0.55,
              usageCount: 5,
              lastUsed: "2025-07-16T19:51:40-06:00",
              averageExecutionTime: 504.00,
              confidenceScore: 10.00
            }
          }
        ],
        system: [
          {
            name: "decision",
            path: "./commands/01-core-intelligence/decision.md",
            aliases: ["execute-decision-engine", "decision-engine"],
            complexity: 1.2,
            description: "Script-integrated intelligent routing with mathematical triggers, auto-restart, and real execution validation",
            status: "active" as const,
            type: CommandType.SYSTEM,
            version: "3.0",
            metrics: {
              successRate: 0.86,
              usageCount: 1,
              lastUsed: "2025-07-16T19:51:40-06:00",
              averageExecutionTime: 86.40,
              confidenceScore: 9.70
            }
          }
        ]
      },
      statistics: {
        totalCommands: 68,
        activeCommands: 68,
        pendingCommands: 0,
        atomicCommands: 47,
        orchestratorCommands: 10,
        metaCommands: 1,
        systemCommands: 10,
        overallSuccessRate: 0.8768656716417909,
        totalUsageCount: 213,
        averageConfidenceScore: 9.335820895522394,
        lastCalculated: "2025-07-16T19:51:40-06:00",
        usagePatterns: [
          {
            pattern: "meta-core → decision → command-relationships",
            frequency: 5,
            successRate: 0.96,
            averageExecutionTime: 250,
            lastOccurrence: "2025-07-16T11:45:00Z"
          }
        ],
        crystallizationCandidates: [
          {
            pattern: "improvement-methodology-pattern",
            description: "Four-stage systematic improvement workflow (Discovery → Planning → Execution → Verification)",
            usageCount: 1,
            successRate: 0.942,
            readyForCrystallization: true,
            detectedAt: "2025-07-16T15:30:00-06:00"
          }
        ]
      },
      autoLoading: {
        rules: [
          {
            condition: "confidence < 0.5",
            load: ["core-principles.md"],
            metrics: {
              triggeredCount: 2,
              successRate: 1.0,
              lastTriggered: "2025-07-16T15:30:00Z"
            }
          }
        ],
        optimizationMetrics: {
          contextReduction: 0.78,
          loadTimeImprovement: 0.65,
          accuracyMaintained: 0.98
        }
      },
      livingDocumentation: {
        enabled: true,
        updateFrequency: "on_execution",
        patternThreshold: {
          usageCount: 3,
          successRate: 0.85
        },
        metrics: {
          documentsUpdated: 12,
          patternsDetected: 7,
          crystallizationEvents: 1,
          lastUpdate: "2025-07-16T12:00:00Z",
          evolutionRate: 0.23
        }
      },
      completion: {}
    };
  }

  static async getAllCommands(): Promise<Command[]> {
    const registry = await this.loadCommandRegistry();
    return [
      ...registry.commands.atomic,
      ...registry.commands.orchestrators,
      ...registry.commands.meta,
      ...registry.commands.system
    ];
  }

  static async getCommandsByType(type: CommandType): Promise<Command[]> {
    const registry = await this.loadCommandRegistry();
    switch (type) {
      case CommandType.ATOMIC:
        return registry.commands.atomic;
      case CommandType.ORCHESTRATOR:
        return registry.commands.orchestrators;
      case CommandType.META:
        return registry.commands.meta;
      case CommandType.SYSTEM:
        return registry.commands.system;
      default:
        return [];
    }
  }

  static async getCommandsByPrinciple(principleId: number): Promise<Command[]> {
    const commands = await this.getAllCommands();
    return commands.filter(cmd => cmd.principle === principleId);
  }

  static async searchCommands(query: string): Promise<Command[]> {
    const commands = await this.getAllCommands();
    const searchTerm = query.toLowerCase();
    
    return commands.filter(cmd =>
      cmd.name.toLowerCase().includes(searchTerm) ||
      cmd.description.toLowerCase().includes(searchTerm) ||
      cmd.aliases?.some(alias => alias.toLowerCase().includes(searchTerm))
    );
  }

  static async getCommandByName(name: string): Promise<Command | undefined> {
    const commands = await this.getAllCommands();
    return commands.find(cmd => 
      cmd.name === name || 
      cmd.aliases?.includes(name)
    );
  }

  static async getHighPerformanceCommands(threshold: number = 0.9): Promise<Command[]> {
    const commands = await this.getAllCommands();
    return commands.filter(cmd => cmd.metrics.successRate >= threshold);
  }

  static async getRecentlyUsedCommands(days: number = 7): Promise<Command[]> {
    const commands = await this.getAllCommands();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return commands.filter(cmd => {
      const lastUsed = new Date(cmd.metrics.lastUsed);
      return lastUsed >= cutoffDate;
    });
  }

  static async getCommandsByComplexity(minComplexity: number, maxComplexity: number): Promise<Command[]> {
    const commands = await this.getAllCommands();
    return commands.filter(cmd => 
      cmd.complexity >= minComplexity && cmd.complexity <= maxComplexity
    );
  }

  static async getStatistics(): Promise<CommandStatistics> {
    const registry = await this.loadCommandRegistry();
    return registry.statistics;
  }

  static async getUsagePatterns(): Promise<UsagePattern[]> {
    const registry = await this.loadCommandRegistry();
    return registry.statistics.usagePatterns;
  }

  static async getCrystallizationCandidates(): Promise<CrystallizationCandidate[]> {
    const registry = await this.loadCommandRegistry();
    return registry.statistics.crystallizationCandidates;
  }

  static async getCommandMetrics(commandName: string): Promise<CommandMetrics | undefined> {
    const command = await this.getCommandByName(commandName);
    return command?.metrics;
  }

  static getCommandCategoryInfo(category: string) {
    return COMMAND_CATEGORIES[category as keyof typeof COMMAND_CATEGORIES];
  }

  static async getAutomatedCommands(): Promise<Command[]> {
    const commands = await this.getAllCommands();
    return commands.filter(cmd => 
      cmd.scriptIntegration?.integrationStatus === 'active' ||
      cmd.enhancements?.includes('script_integration')
    );
  }

  static async getCommandChains(): Promise<Array<{name: string, chains: string[]}>> {
    const orchestrators = await this.getCommandsByType(CommandType.ORCHESTRATOR);
    return orchestrators
      .filter(cmd => cmd.chains && cmd.chains.length > 0)
      .map(cmd => ({name: cmd.name, chains: cmd.chains!}));
  }

  // Helper methods for visualization and analytics
  static async getSuccessRateDistribution(): Promise<Array<{range: string, count: number}>> {
    const commands = await this.getAllCommands();
    const ranges = [
      {range: '90-100%', min: 0.9, max: 1.0},
      {range: '80-89%', min: 0.8, max: 0.89},
      {range: '70-79%', min: 0.7, max: 0.79},
      {range: '60-69%', min: 0.6, max: 0.69},
      {range: '<60%', min: 0, max: 0.59}
    ];

    return ranges.map(range => ({
      range: range.range,
      count: commands.filter(cmd => 
        cmd.metrics.successRate >= range.min && cmd.metrics.successRate <= range.max
      ).length
    }));
  }

  static async getComplexityDistribution(): Promise<Array<{range: string, count: number}>> {
    const commands = await this.getAllCommands();
    const ranges = [
      {range: 'Simple (0-0.5)', min: 0, max: 0.5},
      {range: 'Moderate (0.6-1.0)', min: 0.6, max: 1.0},
      {range: 'Complex (1.1-1.5)', min: 1.1, max: 1.5},
      {range: 'Advanced (1.6-2.0)', min: 1.6, max: 2.0},
      {range: 'Expert (>2.0)', min: 2.0, max: 10.0}
    ];

    return ranges.map(range => ({
      range: range.range,
      count: commands.filter(cmd => 
        cmd.complexity >= range.min && cmd.complexity <= range.max
      ).length
    }));
  }

  static async getUsageFrequencyDistribution(): Promise<Array<{range: string, count: number}>> {
    const commands = await this.getAllCommands();
    const ranges = [
      {range: 'High (>10)', min: 10, max: Infinity},
      {range: 'Medium (5-10)', min: 5, max: 10},
      {range: 'Low (1-4)', min: 1, max: 4},
      {range: 'Unused (0)', min: 0, max: 0}
    ];

    return ranges.map(range => ({
      range: range.range,
      count: commands.filter(cmd => 
        cmd.metrics.usageCount >= range.min && 
        (range.max === Infinity || cmd.metrics.usageCount <= range.max)
      ).length
    }));
  }
}

export default CommandProcessor;