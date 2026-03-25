import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-surface border-[0.5px] border-border text-foreground transition-colors hover:border-muted/30",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
