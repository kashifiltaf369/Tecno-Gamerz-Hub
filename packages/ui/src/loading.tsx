import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const loadingVariants = cva("", {
  variants: {
    variant: {
      spinner: "animate-spin rounded-full border-2 border-current border-t-transparent",
      dots: "flex space-x-1",
      pulse: "animate-pulse",
      wave: "flex space-x-1",
      gaming: "animate-spin rounded-full border-2 border-gaming-neon border-t-transparent shadow-gaming-neon/50",
    },
    size: {
      sm: "",
      default: "",
      lg: "",
      xl: "",
    },
  },
  defaultVariants: {
    variant: "spinner",
    size: "default",
  },
});

const sizeClasses = {
  spinner: {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  },
  dots: {
    sm: "h-1 w-1",
    default: "h-2 w-2",
    lg: "h-3 w-3",
    xl: "h-4 w-4",
  },
  pulse: {
    sm: "h-4 w-16",
    default: "h-6 w-24",
    lg: "h-8 w-32",
    xl: "h-12 w-48",
  },
};

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, variant = "spinner", size = "default", text, ...props }, ref) => {
    if (variant === "dots") {
      return (
        <div
          ref={ref}
          className={cn("flex items-center space-x-2", className)}
          {...props}
        >
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-current rounded-full animate-pulse",
                  sizeClasses.dots[size],
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
          {text && <span className="text-sm text-muted-foreground">{text}</span>}
        </div>
      );
    }

    if (variant === "wave") {
      return (
        <div
          ref={ref}
          className={cn("flex items-center space-x-2", className)}
          {...props}
        >
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-current rounded-sm animate-pulse",
                  sizeClasses.dots[size],
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.8s",
                  height: `${8 + (i % 3) * 4}px`,
                }}
              />
            ))}
          </div>
          {text && <span className="text-sm text-muted-foreground">{text}</span>}
        </div>
      );
    }

    if (variant === "pulse") {
      return (
        <div
          ref={ref}
          className={cn("flex items-center space-x-2", className)}
          {...props}
        >
          <div
            className={cn(
              "bg-current rounded animate-pulse",
              sizeClasses.pulse[size],
            )}
          />
          {text && <span className="text-sm text-muted-foreground">{text}</span>}
        </div>
      );
    }

    // Default spinner variant
    return (
      <div
        ref={ref}
        className={cn("flex items-center space-x-2", className)}
        {...props}
      >
        <div
          className={cn(
            loadingVariants({ variant }),
            sizeClasses.spinner[size],
          )}
        />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }
);
Loading.displayName = "Loading";

// Loading skeleton component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  avatar?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, lines = 1, avatar = false, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {avatar && (
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        )}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 bg-muted rounded animate-pulse",
              i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </div>
    );
  }
);
Skeleton.displayName = "Skeleton";

// Full page loading component
export interface PageLoadingProps {
  text?: string;
  variant?: "spinner" | "gaming";
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  text = "Loading...", 
  variant = "spinner" 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loading 
          variant={variant} 
          size="xl" 
          className="justify-center" 
        />
        <div>
          <h2 className="text-lg font-semibold">Tecno Gamerz Hub</h2>
          <p className="text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
};

export { Loading, Skeleton, PageLoading, loadingVariants };