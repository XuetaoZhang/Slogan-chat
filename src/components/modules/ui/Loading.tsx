interface LoadingProps {
  classNames?: string;
  loading?: "spinner" | "ring" | "dots" | "ball" | "bars" | "infinity";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
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

const loadingClassMap: Record<string, string> = {
  spinner: "loading-spinner",
  ring: "loading-ring",
  dots: "loading-dots",
  ball: "loading-ball",
  bars: "loading-bars",
  infinity: "loading-infinity",
};

const sizeClassMap: Record<string, string> = {
  xs: "loading-xs",
  sm: "loading-sm",
  md: "loading-md",
  lg: "loading-lg",
  xl: "loading-xl",
};

const colorClassMap: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  neutral: "text-neutral",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

const Loading = ({
  loading = "spinner",
  size = "md",
  color = "info",
  classNames,
}: LoadingProps) => {
  const loadingClass = loadingClassMap[loading];
  const sizeClass = sizeClassMap[size];
  const colorClass = colorClassMap[color];

  return (
    <span
      className={`loading ${loadingClass} ${sizeClass} ${colorClass} ${classNames}`}
    ></span>
  );
};

export default Loading;
