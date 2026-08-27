"use client";

import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: "active" | "paused" | "churned" | "onboarding" | "ok" | "error" | "unknown" | "degraded";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  label?: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  active: "bg-success",
  ok: "bg-success",
  paused: "bg-warning",
  degraded: "bg-warning",
  churned: "bg-danger",
  error: "bg-danger",
  onboarding: "bg-primary",
  unknown: "bg-text-dim",
};

const sizeMap = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

export default function StatusDot({ status, size = "md", pulse = false, label, className }: StatusDotProps) {
  const color = colorMap[status] ?? "bg-text-dim";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative flex">
        {pulse && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-50",
              color
            )}
          />
        )}
        <span className={cn("relative inline-flex rounded-full", color, sizeMap[size])} />
      </span>
      {label && <span className="text-sm text-text-muted">{label}</span>}
    </span>
  );
}
