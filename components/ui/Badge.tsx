"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "amber" | "red" | "purple" | "indigo" | "gray";
  className?: string;
}

const variantMap = {
  green: "badge-green",
  amber: "badge-amber",
  red: "badge-red",
  purple: "badge-purple",
  indigo: "badge-indigo",
  gray: "badge bg-bg-border text-text-muted",
};

export default function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span className={cn(variantMap[variant], className)}>
      {children}
    </span>
  );
}
