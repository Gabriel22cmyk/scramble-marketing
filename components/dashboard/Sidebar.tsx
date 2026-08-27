"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 flex flex-col bg-bg-secondary border-r border-bg-border z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-text leading-none">Scramble</p>
            <p className="text-[10px] text-text-muted leading-none mt-0.5">Marketing Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              isActive(href) ? "nav-link-active" : "nav-link",
              "group"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {isActive(href) && (
              <ChevronRight className="w-3 h-3 opacity-50" />
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
