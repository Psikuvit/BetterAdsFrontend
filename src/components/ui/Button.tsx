import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-brand text-white shadow-glow-blue hover:shadow-glow-purple hover:brightness-110 disabled:opacity-50",
  secondary:
    "bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300 dark:bg-white/5 dark:text-neutral-100 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20 disabled:opacity-50",
  danger: "bg-error/90 text-white hover:bg-error hover:brightness-110 shadow-[0_0_20px_rgba(239,68,68,0.25)] disabled:opacity-50",
  ghost: "bg-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-white/5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading, disabled, className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ease-smooth hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});
