/**
 * Principles Type Definitions
 * 
 * Shared types for the principles system to avoid circular imports
 */

export interface PrincipleBase {
  id: number;
  name: string;
  title: string;
  definition: string;
  category: PrincipleCategory;
  categoryName: string;
  categoryEmoji: string;
  slug: string;
  categorySlug: string;
}

export interface DetailedPrinciple extends PrincipleBase {
  implementation?: string[];
  protocol?: string[];
  process?: string[];
  requirements?: string[];
  components?: string[];
  framework?: string[];
  seeAlso?: string[];
  crossReferences?: CrossReference[];
  metrics?: PrincipleMetrics;
  examples?: string[];
  formula?: string;
  thresholds?: Record<string, number | string>;
  triggers?: string[];
  automation?: AutomationConfig;
  visualFormat?: string;
  keyFeatures?: string[];
}

export interface CrossReference {
  principleId: number;
  category: PrincipleCategory;
  relationship: 'enables' | 'requires' | 'optimizes' | 'validates' | 'enhances' | 'evolves';
  description: string;
}

export interface PrincipleMetrics {
  successRate?: number;
  targetThreshold?: number;
  unit?: string;
  description?: string;
  indicators?: Record<string, string>;
}

export interface AutomationConfig {
  autoActivation?: boolean;
  triggers?: string[];
  conditions?: string[];
  scriptIntegration?: boolean;
}

export enum PrincipleCategory {
  PHILOSOPHICAL = 'philosophical',
  OPERATIONAL = 'operational', 
  TECHNICAL = 'technical',
  MATHEMATICAL = 'mathematical',
  VALIDATION = 'validation',
  COGNITIVE = 'cognitive',
  ADAPTATION = 'adaptation'
}