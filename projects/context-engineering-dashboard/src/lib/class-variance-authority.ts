// Temporary implementation of class-variance-authority
// This provides the cva function used in Badge component

export type ClassValue = string | number | boolean | undefined | null
export type ClassArray = ClassValue[]
export type ClassDictionary = Record<string, any>
export type ClassProp = ClassValue | ClassArray | ClassDictionary

export interface VariantConfig {
  variants?: Record<string, Record<string, string>>
  defaultVariants?: Record<string, string>
}

export type VariantFunction = (props?: Record<string, any>) => string

export type VariantProps<T extends VariantFunction> = T extends (props?: infer P) => any 
  ? P 
  : never

export function cva(
  base: string,
  config?: VariantConfig
): VariantFunction {
  return (props?: Record<string, any>) => {
    let classes = base
    
    if (config?.variants && props) {
      Object.entries(config.variants).forEach(([key, variants]) => {
        const value = props[key] || config.defaultVariants?.[key]
        if (value && variants[value]) {
          classes += ' ' + variants[value]
        }
      })
    }
    
    return classes
  }
}