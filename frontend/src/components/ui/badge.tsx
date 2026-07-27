import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary border border-primary/25',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive/15 text-destructive border border-destructive/25',
        outline: 'text-foreground border border-border',
        success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25',
        warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25',
        info: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25',
        purple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25',
        ghost: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
