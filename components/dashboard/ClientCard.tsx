"use client";

import Link from "next/link";
import { ExternalLink, TrendingUp, Calendar } from "lucide-react";
import { Client } from "@/lib/types";
import { getPackageLabel, formatDate } from "@/lib/utils";
import StatusDot from "@/components/ui/StatusDot";
import Badge from "@/components/ui/Badge";

interface ClientCardProps {
  client: Client;
}

function getPackageBadgeVariant(pkg: string): "indigo" | "purple" | "green" | "gray" {
  switch (pkg) {
    case "seo": return "indigo";
    case "seo-ads": return "purple";
    case "ads": return "green";
    default: return "gray";
  }
}

function getStatusBadgeVariant(status: string): "green" | "amber" | "red" | "indigo" | "gray" {
  switch (status) {
    case "active": return "green";
    case "paused": return "amber";
    case "churned": return "red";
    case "onboarding": return "indigo";
    default: return "gray";
  }
}

export default function ClientCard({ client }: ClientCardProps) {
  const initials = client.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link href={`/clients/${client.id}`}>
      <div className="card hover:border-primary/30 hover:shadow-glow transition-all duration-200 cursor-pointer group">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-text group-hover:text-primary transition-colors truncate">
                {client.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge variant={getStatusBadgeVariant(client.status)}>
                  <StatusDot status={client.status as "active" | "paused" | "churned" | "onboarding"} size="sm" />
                  {client.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-0.5">
              <a
                href={`https://${client.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1"
              >
                {client.domain}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <Badge variant={getPackageBadgeVariant(client.package)}>
                {getPackageLabel(client.package)}
              </Badge>

              <div className="flex items-center gap-1 text-xs text-text-dim">
                <Calendar className="w-3 h-3" />
                <span>Since {formatDate(client.startDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration status */}
        <div className="mt-4 pt-4 border-t border-bg-border flex items-center gap-4">
          <IntegrationStatus label="Search Console" connected={!!client.siteUrl} />
          <IntegrationStatus label="Analytics" connected={!!client.analyticsPropertyId} />
          <IntegrationStatus label="Google Ads" connected={!!client.adsCustomerId} />
        </div>
      </div>
    </Link>
  );
}

function IntegrationStatus({ label, connected }: { label: string; connected: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <StatusDot
        status={connected ? "active" : "unknown"}
        size="sm"
      />
      <span className="text-xs text-text-dim">{label}</span>
    </div>
  );
}
