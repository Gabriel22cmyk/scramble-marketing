"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
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
    <aside className="fixed inset-y-0 left-0 w-56 flex flex-col bg-bg-secondary border-r border-bg-border z-40">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-bg-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-sm font-semibold text-text tracking-tight">Scramble</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              isActive(href) ? "nav-link-active" : "nav-link",
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center">
            <span className="text-xs font-medium text-text-muted">G</span>
          </div>
          <div>
            <p className="text-xs font-medium text-text leading-none">Gabriel</p>
            <p className="text-[11px] text-text-dim leading-none mt-0.5">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
