/**
 * Principles Hub - Central Index for Context Engineering Principles
 * 
 * This module serves as the main entry point for all principle-related functionality,
 * maintaining complete compatibility with existing imports while providing modular architecture.
 * 
 * ARCHITECTURE: Hub-pattern following Principle #58 (Recursive Modularization)
 * - Total: 56 principles across 7 categories 
 * - Modules: 3 specialized modules (≤400 lines each)
 * - Hub: Central re-export and orchestration (≤200 lines)
 */

// Re-export all types from the types module
export * from './principles-types';
import { DetailedPrinciple, PrincipleCategory, CrossReference, PrincipleMetrics } from './principles-types';

export const CATEGORY_CONFIG = {
  [PrincipleCategory.PHILOSOPHICAL]: {
    name: 'Philosophical Foundations',
    emoji: '🌟',
    description: 'Conceptual foundations defining Context Engineering system essence and direction',
    count: 6,
    principleIds: [1, 2, 3, 4, 6, 55]
  },
  [PrincipleCategory.OPERATIONAL]: {
    name: 'Operational Excellence', 
    emoji: '⚙️',
    description: 'Natural workflow methodology: Discover → Plan → Execute → Verify → Document',
    count: 11,
    principleIds: [7, 8, 9, 10, 13, 14, 15, 16, 33, 34, 56]
  },
  [PrincipleCategory.TECHNICAL]: {
    name: 'Technical Standards',
    emoji: '🔧', 
    description: 'Advanced execution techniques, optimization protocols, and scalable system architecture',
    count: 13,
    principleIds: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 32, 35, 36]
  },
  [PrincipleCategory.MATHEMATICAL]: {
    name: 'Mathematical Rigor',
    emoji: '🧮',
    description: 'Quantitative foundations providing mathematical basis for decisions, verification, and system optimization',
    count: 9,
    principleIds: [5, 27, 28, 29, 30, 38, 39, 40, 41]
  },
  [PrincipleCategory.VALIDATION]: {
    name: 'Validation Protocols',
    emoji: '🔍',
    description: 'Verification and quality assurance providing multi-dimensional "sight" to AI system',
    count: 6,
    principleIds: [11, 12, 31, 37, 48, 53]
  },
  [PrincipleCategory.COGNITIVE]: {
    name: 'Cognitive Optimization',
    emoji: '🎯',
    description: 'Usability optimizing human experience, minimizing cognitive friction',
    count: 2,
    principleIds: [42, 43]
  },
  [PrincipleCategory.ADAPTATION]: {
    name: 'Intelligent Adaptation',
    emoji: '🚀',
    description: 'Advanced intelligence transforming static execution into dynamic intelligent adaptation',
    count: 9,
    principleIds: [44, 45, 46, 47, 49, 50, 51, 52, 54]
  }
} as const;

// Import specialized modules
import { TECHNICAL_PRINCIPLES } from './technical-principles';
import { OPERATIONAL_PRINCIPLES } from './operational-principles';
import { BEHAVIORAL_PRINCIPLES } from './behavioral-principles';

// Consolidated principles data
export const PRINCIPLES_DATA: DetailedPrinciple[] = [
  ...TECHNICAL_PRINCIPLES,
  ...OPERATIONAL_PRINCIPLES,
  ...BEHAVIORAL_PRINCIPLES
];

// Utility functions for working with principles
export class PrincipleProcessor {
  static getPrincipleById(id: number): DetailedPrinciple | undefined {
    return PRINCIPLES_DATA.find(p => p.id === id);
  }

  static getPrinciplesByCategory(category: PrincipleCategory): DetailedPrinciple[] {
    return PRINCIPLES_DATA.filter(p => p.category === category);
  }

  static searchPrinciples(query: string): DetailedPrinciple[] {
    const searchTerm = query.toLowerCase();
    return PRINCIPLES_DATA.filter(p => 
      p.title.toLowerCase().includes(searchTerm) ||
      p.definition.toLowerCase().includes(searchTerm) ||
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  static getCrossReferences(principleId: number): CrossReference[] {
    const principle = this.getPrincipleById(principleId);
    return principle?.crossReferences || [];
  }

  static getPrincipleRelationships(): Record<number, CrossReference[]> {
    const relationships: Record<number, CrossReference[]> = {};
    
    PRINCIPLES_DATA.forEach(principle => {
      if (principle.crossReferences) {
        relationships[principle.id] = principle.crossReferences;
      }
    });
    
    return relationships;
  }

  static getAutomatedPrinciples(): DetailedPrinciple[] {
    return PRINCIPLES_DATA.filter(p => p.automation?.autoActivation);
  }

  static getPrincipleMetrics(): Record<number, PrincipleMetrics> {
    const metrics: Record<number, PrincipleMetrics> = {};
    
    PRINCIPLES_DATA.forEach(principle => {
      if (principle.metrics) {
        metrics[principle.id] = principle.metrics;
      }
    });
    
    return metrics;
  }

  static getMathematicalFormulas(): Array<{principleId: number, formula: string}> {
    return PRINCIPLES_DATA
      .filter(p => p.formula)
      .map(p => ({principleId: p.id, formula: p.formula!}));
  }

  static getThresholds(): Record<number, Record<string, number | string>> {
    const thresholds: Record<number, Record<string, number | string>> = {};
    
    PRINCIPLES_DATA.forEach(principle => {
      if (principle.thresholds) {
        thresholds[principle.id] = principle.thresholds;
      }
    });
    
    return thresholds;
  }
}

// Helper function to get category slug from enum
export function getCategorySlug(category: PrincipleCategory): string {
  const slugMapping: Record<PrincipleCategory, string> = {
    [PrincipleCategory.PHILOSOPHICAL]: 'philosophical-foundations',
    [PrincipleCategory.OPERATIONAL]: 'operational-excellence',
    [PrincipleCategory.TECHNICAL]: 'technical-standards',
    [PrincipleCategory.MATHEMATICAL]: 'mathematical-rigor',
    [PrincipleCategory.VALIDATION]: 'validation-protocols',
    [PrincipleCategory.COGNITIVE]: 'cognitive-optimization',
    [PrincipleCategory.ADAPTATION]: 'intelligent-adaptation'
  };

  return slugMapping[category];
}

export default PrincipleProcessor;