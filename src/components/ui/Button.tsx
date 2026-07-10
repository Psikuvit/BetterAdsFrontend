import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-accent border border-border",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  outline: "bg-transparent text-foreground border border-input hover:bg-accent",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 py-2 text-sm",
  lg: "h-10 px-6 text-sm",
  icon: "size-9",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, disabled, className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        "active:scale-[0.97]",
        variantClasses[variant],
        sizeClasses[size],
        loading && "cursor-progress",
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});
