"use client";

import { Bell, Search } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-bg-border bg-bg-secondary/50 backdrop-blur-sm">
      <div>
        <h1 className="text-base font-semibold text-text">{title}</h1>
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <button
          className="p-2 rounded-lg hover:bg-bg-border text-text-muted hover:text-text transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          className="relative p-2 rounded-lg hover:bg-bg-border text-text-muted hover:text-text transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>
      </div>
    </header>
  );
}
