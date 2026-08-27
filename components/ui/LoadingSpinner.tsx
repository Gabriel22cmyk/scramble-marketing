"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const borderSizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function LoadingSpinner({ size = "md", className = "", text }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`rounded-full border-2 animate-spin ${borderSizeMap[size]}`}
        style={{ borderColor: "var(--color-bg-border)", borderTopColor: "var(--color-primary)" }}
      />
      {text && <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{text}</span>}
    </div>
  );
}

export default LoadingSpinner;

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{text}</p>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ backgroundColor: "var(--color-bg-tertiary)" }}
    />
  );
}
