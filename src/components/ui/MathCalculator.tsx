'use client';

import React, { useState, useCallback } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { MathFormula } from './MathFormula';

interface CalculatorInput {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description?: string;
}

interface FormulaCalculator {
  id: string;
  name: string;
  description: string;
  formula: string;
  variables: CalculatorInput[];
  calculate: (inputs: Record<string, number>) => number;
  interpretation?: (result: number) => string;
  threshold?: number;
  examples?: Array<{
    name: string;
    inputs: Record<string, number>;
    expectedResult: number;
  }>;
}

// Mathematical formulas from the Context Engineering system
export const MATH_CALCULATORS: FormulaCalculator[] = [
  {
    id: 'confidence-score',
    name: 'Confidence Score Calculator',
    description: 'Calculate confidence score based on pattern matching, context clarity, objective specificity, and domain familiarity',
    formula: 'Confidence = (Pattern_Match × 0.3) + (Context_Clarity × 0.4) + (Objective_Specificity × 0.2) + (Domain_Familiarity × 0.1)',
    variables: [
      {
        name: 'patternMatch',
        label: 'Pattern Match',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.8,
        description: 'How well the request matches known patterns (0-1)'
      },
      {
        name: 'contextClarity',
        label: 'Context Clarity',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.7,
        description: 'Clarity of the provided context (0-1)'
      },
      {
        name: 'objectiveSpecificity',
        label: 'Objective Specificity',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.6,
        description: 'How specific the objectives are (0-1)'
      },
      {
        name: 'domainFamiliarity',
        label: 'Domain Familiarity',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.9,
        description: 'Familiarity with the domain (0-1)'
      }
    ],
    calculate: (inputs) => {
      return (inputs.patternMatch * 0.3) + 
             (inputs.contextClarity * 0.4) + 
             (inputs.objectiveSpecificity * 0.2) + 
             (inputs.domainFamiliarity * 0.1);
    },
    interpretation: (result) => {
      if (result >= 0.9) return 'High confidence - Direct command execution';
      if (result >= 0.7) return 'Moderate confidence - Multi-command coordination';
      if (result >= 0.5) return 'Low-medium confidence - Complex orchestration';
      return 'Low confidence - Task agent deployment';
    },
    threshold: 0.7,
    examples: [
      {
        name: 'Simple Task',
        inputs: { patternMatch: 0.9, contextClarity: 0.8, objectiveSpecificity: 0.9, domainFamiliarity: 0.8 },
        expectedResult: 0.85
      },
      {
        name: 'Complex Task',
        inputs: { patternMatch: 0.5, contextClarity: 0.6, objectiveSpecificity: 0.4, domainFamiliarity: 0.7 },
        expectedResult: 0.55
      }
    ]
  },
  {
    id: 'complexity-score',
    name: 'Task Complexity Calculator',
    description: 'Calculate task complexity based on objectives, dependencies, and integration requirements',
    formula: 'Complexity = (log(objectives + 1) × 0.4) + (dependencies × 0.4) + (integration × 0.2)',
    variables: [
      {
        name: 'objectives',
        label: 'Number of Objectives',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 3,
        description: 'Number of distinct objectives to achieve'
      },
      {
        name: 'dependencies',
        label: 'Dependency Factor',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.5,
        description: 'Level of interdependencies between tasks (0-1)'
      },
      {
        name: 'integration',
        label: 'Integration Complexity',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.3,
        description: 'Complexity of system integration required (0-1)'
      }
    ],
    calculate: (inputs) => {
      const logObjectives = Math.log(inputs.objectives + 1);
      return (logObjectives * 0.4) + (inputs.dependencies * 0.4) + (inputs.integration * 0.2);
    },
    interpretation: (result) => {
      if (result >= 1.0) return 'High complexity - Advanced orchestration required';
      if (result >= 0.7) return 'Moderate complexity - Multi-step approach';
      if (result >= 0.4) return 'Low complexity - Standard execution';
      return 'Simple task - Direct execution';
    },
    threshold: 1.0
  },
  {
    id: 'parallel-benefit',
    name: 'Net Parallel Benefit Calculator',
    description: 'Calculate the net benefit of parallel execution vs sequential',
    formula: 'Net_Parallel_Benefit = (Sequential_Time - Parallel_Time) / Sequential_Time - Coordination_Overhead',
    variables: [
      {
        name: 'sequentialTime',
        label: 'Sequential Time (minutes)',
        min: 1,
        max: 120,
        step: 1,
        defaultValue: 30,
        description: 'Estimated time for sequential execution'
      },
      {
        name: 'parallelTime',
        label: 'Parallel Time (minutes)',
        min: 1,
        max: 120,
        step: 1,
        defaultValue: 15,
        description: 'Estimated time for parallel execution'
      },
      {
        name: 'coordinationOverhead',
        label: 'Coordination Overhead',
        min: 0,
        max: 0.5,
        step: 0.05,
        defaultValue: 0.1,
        description: 'Additional overhead for coordination (0-0.5)'
      }
    ],
    calculate: (inputs) => {
      const timeSaved = (inputs.sequentialTime - inputs.parallelTime) / inputs.sequentialTime;
      return timeSaved - inputs.coordinationOverhead;
    },
    interpretation: (result) => {
      if (result >= 0.3) return 'High benefit - Parallel execution recommended';
      if (result >= 0.1) return 'Moderate benefit - Consider parallel execution';
      if (result >= 0) return 'Low benefit - Parallel execution optional';
      return 'Negative benefit - Sequential execution preferred';
    },
    threshold: 0.3
  },
  {
    id: 'mathematical-simplicity',
    name: 'Mathematical Simplicity Score',
    description: 'Measure simplicity using the Context Engineering simplicity formula',
    formula: 'Simplicity = (Size × Features × Dependencies × Responsibilities) / (Atomic_Compliance × Purpose_Clarity)',
    variables: [
      {
        name: 'size',
        label: 'Size Factor',
        min: 0.1,
        max: 2.0,
        step: 0.1,
        defaultValue: 1.0,
        description: 'Relative size of the component (0.1-2.0)'
      },
      {
        name: 'features',
        label: 'Feature Density',
        min: 0.1,
        max: 2.0,
        step: 0.1,
        defaultValue: 1.0,
        description: 'Number of features per unit size (0.1-2.0)'
      },
      {
        name: 'dependencies',
        label: 'Dependency Factor',
        min: 0.1,
        max: 2.0,
        step: 0.1,
        defaultValue: 0.5,
        description: 'Number and complexity of dependencies (0.1-2.0)'
      },
      {
        name: 'responsibilities',
        label: 'Responsibility Factor',
        min: 0.1,
        max: 2.0,
        step: 0.1,
        defaultValue: 0.8,
        description: 'Number of distinct responsibilities (0.1-2.0)'
      },
      {
        name: 'atomicCompliance',
        label: 'Atomic Compliance',
        min: 0.1,
        max: 1.0,
        step: 0.1,
        defaultValue: 0.9,
        description: 'How well it follows atomic principles (0.1-1.0)'
      },
      {
        name: 'purposeClarity',
        label: 'Purpose Clarity',
        min: 0.1,
        max: 1.0,
        step: 0.1,
        defaultValue: 0.8,
        description: 'Clarity of purpose and intent (0.1-1.0)'
      }
    ],
    calculate: (inputs) => {
      const numerator = inputs.size * inputs.features * inputs.dependencies * inputs.responsibilities;
      const denominator = inputs.atomicCompliance * inputs.purposeClarity;
      return numerator / denominator;
    },
    interpretation: (result) => {
      if (result <= 1.0) return 'Excellent simplicity - Well-designed component';
      if (result <= 2.0) return 'Good simplicity - Minor improvements possible';
      if (result <= 3.0) return 'Moderate complexity - Consider refactoring';
      return 'High complexity - Refactoring recommended';
    },
    threshold: 2.0
  }
];

interface MathCalculatorProps {
  calculator: FormulaCalculator;
  className?: string;
}

export function MathCalculator({ calculator, className = '' }: MathCalculatorProps) {
  const [inputs, setInputs] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    calculator.variables.forEach(variable => {
      initial[variable.name] = variable.defaultValue;
    });
    return initial;
  });

  const [result, setResult] = useState<number>(0);

  const calculateResult = useCallback(() => {
    const newResult = calculator.calculate(inputs);
    setResult(newResult);
  }, [inputs, calculator]);

  React.useEffect(() => {
    calculateResult();
  }, [calculateResult]);

  const handleInputChange = (name: string, value: number) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const getResultColor = () => {
    if (!calculator.threshold) return 'bg-blue-500';
    return result >= calculator.threshold ? 'bg-green-500' : 'bg-yellow-500';
  };

  const runExample = (example: any) => {
    setInputs(example.inputs);
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {calculator.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {calculator.description}
          </p>
        </div>

        {/* Formula Display */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Formula:
          </h4>
          <MathFormula formula={calculator.formula} />
        </div>

        {/* Input Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Parameters:
          </h4>
          {calculator.variables.map((variable) => (
            <div key={variable.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {variable.label}
                </label>
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {inputs[variable.name]?.toFixed(variable.step < 1 ? 1 : 0)}
                </span>
              </div>
              <input
                type="range"
                min={variable.min}
                max={variable.max}
                step={variable.step}
                value={inputs[variable.name] || variable.defaultValue}
                onChange={(e) => handleInputChange(variable.name, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              {variable.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {variable.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Result Display */}
        <div className="p-4 bg-mathematical-50 dark:bg-mathematical-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Result:
            </h4>
            <Badge 
              variant="secondary"
              className={`text-white ${getResultColor()}`}
            >
              {result.toFixed(3)}
            </Badge>
          </div>
          {calculator.interpretation && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {calculator.interpretation(result)}
            </p>
          )}
        </div>

        {/* Examples */}
        {calculator.examples && calculator.examples.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Examples:
            </h4>
            <div className="flex flex-wrap gap-2">
              {calculator.examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => runExample(example)}
                  className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 
                           dark:bg-blue-900/30 dark:hover:bg-blue-900/50 
                           text-blue-800 dark:text-blue-200 rounded-full
                           transition-colors duration-200"
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

interface MathCalculatorGridProps {
  calculators?: FormulaCalculator[];
  className?: string;
}

export function MathCalculatorGrid({ 
  calculators = MATH_CALCULATORS, 
  className = '' 
}: MathCalculatorGridProps) {
  return (
    <div className={`grid gap-6 md:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {calculators.map((calculator) => (
        <MathCalculator
          key={calculator.id}
          calculator={calculator}
        />
      ))}
    </div>
  );
}

export default MathCalculator;