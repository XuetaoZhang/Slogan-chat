import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  classNames?: string;
  children?: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?:
    | "btn"
    | "soft"
    | "outline"
    | "dash"
    | "active"
    | "ghost"
    | "link"
    | "wide"
    | "block"
    | "square";
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "error";
}

const sizeClassMap: Record<string, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};

const colorClassMap: Record<string, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  neutral: "btn-neutral",
  info: "btn-info",
  success: "btn-success",
  warning: "btn-warning",
  error: "btn-error",
};

const variantClassMap: Record<string, string> = {
  soft: "btn-soft",
  outline: "btn-outline",
  dash: "btn-dash",
  active: "btn-active",
  ghost: "btn-ghost",
  link: "btn-link",
  wide: "btn-wide",
  block: "btn-block",
  square: "btn-square",
};

const Button = ({
  size = "md",
  color = "info",
  variant = "active",
  children,
  classNames = "",
  ...props
}: ButtonProps) => {
  const sizeClass = sizeClassMap[size];
  const colorClass = colorClassMap[color];
  const variantClass = variantClassMap[variant];

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${colorClass} ${classNames}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
