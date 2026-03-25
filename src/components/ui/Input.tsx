import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const id = React.useId();
    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={id} className="text-[13px] text-muted block">
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            "flex h-10 w-full border border-border bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted/60 focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors rounded-none",
            error && "border-error focus-visible:border-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-[13px] text-error mt-1">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
