"use client";

import Link from "next/link";
import { AlertTriangle, AlertCircle, Info, ArrowRight, CheckCircle } from "lucide-react";
import { ClientAlert } from "@/lib/types";

interface AlertWithClient extends ClientAlert {
  clientId: string;
  clientName: string;
}

interface AlertsPanelProps {
  alerts: AlertWithClient[];
}

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    bg: "bg-danger-dim",
    border: "border-danger",
    iconColor: "text-danger",
    label: "Action required",
    labelColor: "text-danger",
    dot: "bg-danger",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning-dim",
    border: "border-warning",
    iconColor: "text-warning",
    label: "Needs attention",
    labelColor: "text-warning",
    dot: "bg-warning",
  },
  info: {
    icon: Info,
    bg: "bg-primary-dim",
    border: "border-primary",
    iconColor: "text-primary",
    label: "To do",
    labelColor: "text-primary",
    dot: "bg-primary",
  },
};

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-12 h-12 rounded-full bg-success-dim flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-text">All clear</p>
          <p className="text-xs text-text-muted">No action needed right now.</p>
        </div>
      </div>
    );
  }

  const critical = alerts.filter((a) => a.severity === "critical");
  const warning = alerts.filter((a) => a.severity === "warning");
  const info = alerts.filter((a) => a.severity === "info");

  return (
    <div className="flex flex-col gap-2">
      {/* Summary bar */}
      <div className="flex items-center gap-3 mb-1">
        {critical.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-danger">
            <span className="w-2 h-2 rounded-full bg-danger" />
            {critical.length} critical
          </span>
        )}
        {warning.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-warning">
            <span className="w-2 h-2 rounded-full bg-warning" />
            {warning.length} warning
          </span>
        )}
        {info.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {info.length} info
          </span>
        )}
      </div>

      {/* Alert items */}
      {alerts.slice(0, 8).map((alert, idx) => {
        const config = SEVERITY_CONFIG[alert.severity];
        const Icon = config.icon;

        return (
          <div
            key={`${alert.clientId}-${alert.type}-${idx}`}
            className={`flex gap-3 p-3.5 rounded-xl border ${config.bg}`}
            style={{ borderColor: `var(--color-${alert.severity === "critical" ? "danger" : alert.severity === "warning" ? "warning" : "primary"})`, borderWidth: "1px", borderStyle: "solid", opacity: 0.4 }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <Icon className={`w-4 h-4 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-0.5">
                    {alert.clientName}
                  </p>
                  <p className="text-sm font-semibold text-text leading-snug">
                    {alert.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1 leading-snug">
                    {alert.description}
                  </p>
                </div>
              </div>
              {alert.action && alert.actionHref && (
                <Link
                  href={alert.actionHref}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-primary-light transition-colors"
                >
                  {alert.action}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        );
      })}

      {alerts.length > 8 && (
        <p className="text-xs text-text-muted text-center pt-1">
          +{alerts.length - 8} more alerts — view individual client pages
        </p>
      )}
    </div>
  );
}
