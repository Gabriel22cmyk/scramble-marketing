"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "card",
        hover && "hover:border-bg-tertiary hover:shadow-glow transition-all duration-200 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label?: string };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, subtitle, trend, icon, className }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-text-muted">{title}</p>
        {icon && (
          <div className="p-2 rounded-lg bg-bg-tertiary text-text-muted">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-text">{value}</p>
        {trend !== undefined && (
          <span
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-success" : "text-danger"
            )}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            {trend.label && (
              <span className="text-text-muted font-normal ml-1">{trend.label}</span>
            )}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-text-dim">{subtitle}</p>}
    </div>
  );
}
