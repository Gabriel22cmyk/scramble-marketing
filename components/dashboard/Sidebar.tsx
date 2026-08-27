"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Zap,
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
    <aside
      className="fixed inset-y-0 left-0 w-60 flex flex-col z-40"
      style={{
        background: "rgba(10, 15, 22, 0.92)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(28, 42, 56, 0.7)",
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center px-5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(28, 42, 56, 0.7)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow flex-shrink-0"
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-text leading-none">Scramble</p>
            <p
              className="text-[10px] leading-none mt-1 font-medium uppercase tracking-wider"
              style={{ color: "var(--color-text-dim)" }}
            >
              Marketing Hub
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-3 pb-2"
          style={{ color: "var(--color-text-dim)" }}
        >
          Navigation
        </p>
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
          </Link>
        ))}
      </nav>

      {/* User avatar */}
      <div
        className="px-3 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(28, 42, 56, 0.7)" }}
      >
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div
            className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          >
            SM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text leading-none truncate">
              Scramble Admin
            </p>
            <p
              className="text-[10px] leading-none mt-1 truncate"
              style={{ color: "var(--color-text-dim)" }}
            >
              admin@scramble.io
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
