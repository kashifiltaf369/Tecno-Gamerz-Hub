import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-9",
        sm: "h-8 px-2 text-xs",
        lg: "h-10 px-4",
        xl: "h-12 px-5 text-lg",
      },
      variant: {
        default: "",
        gaming: "border-gaming-neon/30 bg-black/20 text-white placeholder:text-gray-400 focus-visible:ring-gaming-neon focus-visible:border-gaming-neon",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: string;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, variant, error, label, helperText, type, ...props }, ref) => {
    const inputId = React.useId();
    
    return (
      <div className="w-full space-y-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ size, variant }),
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          id={inputId}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// Textarea component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  error?: string;
  label?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, variant, error, label, helperText, ...props }, ref) => {
    const textareaId = React.useId();
    
    return (
      <div className="w-full space-y-2">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            inputVariants({ size, variant }),
            "min-h-[80px] resize-none",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          id={textareaId}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea, inputVariants };