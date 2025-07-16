'use client'

import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { cn } from '@/lib/utils'

export interface MathFormulaProps {
  formula: string
  display?: boolean
  className?: string
  errorColor?: string
}

export function MathFormula({ 
  formula, 
  display = false, 
  className,
  errorColor = '#cc0000'
}: MathFormulaProps) {
  const mathProps = {
    errorColor,
    renderError: (error: Error) => (
      <span className="text-red-500 text-sm font-mono">
        Error rendering formula: {error.message}
      </span>
    )
  }

  if (display) {
    return (
      <div className={cn('my-4', className)}>
        <BlockMath math={formula} {...mathProps} />
      </div>
    )
  }

  return (
    <span className={cn('mathematical-emphasis', className)}>
      <InlineMath math={formula} {...mathProps} />
    </span>
  )
}

export interface FormulaBlockProps {
  title?: string
  formula: string
  description?: string
  className?: string
}

export function FormulaBlock({ 
  title, 
  formula, 
  description, 
  className 
}: FormulaBlockProps) {
  return (
    <div className={cn(
      'bg-mathematical-50 dark:bg-mathematical-900/20 rounded-lg p-4 border border-mathematical-200 dark:border-mathematical-700',
      className
    )}>
      {title && (
        <h4 className="font-semibold text-mathematical-800 dark:text-mathematical-200 mb-2">
          {title}
        </h4>
      )}
      
      <div className="text-center">
        <MathFormula formula={formula} display />
      </div>
      
      {description && (
        <p className="text-sm text-mathematical-600 dark:text-mathematical-300 mt-2 text-center">
          {description}
        </p>
      )}
    </div>
  )
}

// Pre-defined mathematical formulas used in Context Engineering
export const ContextEngineeringFormulas = {
  // Core Efficiency Formula
  EFFICIENCY: 'E = \\frac{R \\cdot Q}{C \\cdot T}',
  
  // Progressive Loading Formula  
  PROGRESSIVE_LOADING: 'L(t) = L_0 + \\sum_{i=1}^{n} \\alpha_i \\cdot e^{-\\beta_i t}',
  
  // Cognitive Navigation Formula
  NAVIGATION: 'N_{eff} = \\min(3, \\lceil \\log_2(C) \\rceil)',
  
  // Context Optimization Formula
  CONTEXT_OPT: 'O = 1 - \\frac{C_{actual}}{C_{max}} \\cdot \\frac{D_{relevant}}{D_{total}}',
  
  // Success Rate Formula
  SUCCESS_RATE: 'S = \\frac{\\sum_{i=1}^{n} w_i \\cdot s_i}{\\sum_{i=1}^{n} w_i}',
  
  // Intelligence Evolution Formula
  EVOLUTION: 'I_{t+1} = I_t + \\alpha \\cdot (V \\rightarrow S \\rightarrow R)',
}

export interface PredefinedFormulaProps {
  type: keyof typeof ContextEngineeringFormulas
  title?: string
  description?: string
  className?: string
}

export function PredefinedFormula({ 
  type, 
  title, 
  description, 
  className 
}: PredefinedFormulaProps) {
  const formula = ContextEngineeringFormulas[type]
  
  const defaultTitles = {
    EFFICIENCY: 'Context Engineering Efficiency',
    PROGRESSIVE_LOADING: 'Progressive Loading Function',
    NAVIGATION: 'Cognitive Navigation Efficiency',
    CONTEXT_OPT: 'Context Optimization Ratio',
    SUCCESS_RATE: 'Weighted Success Rate',
    EVOLUTION: 'Intelligence Evolution Process'
  }
  
  return (
    <FormulaBlock
      title={title || defaultTitles[type]}
      formula={formula}
      description={description}
      className={className}
    />
  )
}