import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "bg-white text-foreground border border-border hover:bg-gray-50",
  danger:
    "bg-danger text-white hover:bg-danger-hover",
  ghost:
    "text-muted hover:text-foreground hover:bg-gray-100",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    const sizeClasses =
      size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm";

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
