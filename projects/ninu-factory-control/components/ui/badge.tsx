import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status badges
        status: "border-transparent bg-gray-100 text-gray-800",
        // Ninu custom variants for E-commerce urgency
        urgent: "border-transparent bg-red-500 text-white animate-pulse",
        trending: "border-transparent bg-gradient-to-r from-red-500 to-pink-500 text-white",
        exclusive: "border-transparent bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
        bestseller: "border-transparent bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold",
        new: "border-transparent bg-gradient-to-r from-blue-500 to-purple-500 text-white",
        offer: "border-transparent bg-gradient-to-r from-yellow-400 to-orange-500 text-black animate-bounce",
        recommended: "border-transparent bg-gradient-to-r from-green-400 to-blue-500 text-white",
        // COFEPRIS compliance badges
        cofepris: "border-transparent bg-green-100 text-green-800 font-medium",
        // Product category badges
        limpieza: "border-transparent bg-blue-100 text-blue-800",
        desinfeccion: "border-transparent bg-red-100 text-red-800",
        salud: "border-transparent bg-green-100 text-green-800",
        albercas: "border-transparent bg-cyan-100 text-cyan-800",
        autos: "border-transparent bg-gray-100 text-gray-800",
        alimentos: "border-transparent bg-orange-100 text-orange-800",
        quimicos: "border-transparent bg-purple-100 text-purple-800",
        mascotas: "border-transparent bg-pink-100 text-pink-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }