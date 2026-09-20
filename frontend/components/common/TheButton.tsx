import * as React from "react";

import { cn } from "@/lib/utils";

type TheButtonVariant =
  | "primary"
  | "info"
  | "outline-primary"
  | "outline-secondary"
  | "";
type TheButtonSize = "sm" | "md" | "lg";
type TheButtonRounded = "sm" | "md" | "lg" | "full";

export interface TheButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TheButtonVariant;
  size?: TheButtonSize;
  rounded?: TheButtonRounded;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<TheButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-sm hover:from-primary/90 hover:to-secondary/80",
  info: "bg-primary text-white shadow-sm hover:bg-primary/90",
  "outline-primary":
    "border border-white/10 bg-transparent text-white hover:border-primary hover:text-primary",
  "outline-secondary":
    "border border-white/10 bg-transparent text-white hover:border-secondary hover:text-secondary",
  "": "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-sm hover:from-primary/90 hover:via-primary/80 hover:to-primary/60",
};

const sizeClasses: Record<TheButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2.5 px-6 text-base",
};

const roundedClasses: Record<TheButtonRounded, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const TheButton = React.forwardRef<HTMLButtonElement, TheButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      rounded = "md",
      loading = false,
      fullWidth = false,
      disabled,
      type = "button",
      leftIcon,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          roundedClasses[rounded],
          fullWidth && "w-full",
          isDisabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

TheButton.displayName = "TheButton";

export { TheButton };
export default TheButton;
