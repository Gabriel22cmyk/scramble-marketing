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
        background: "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.4)",
        boxShadow: "1px 0 20px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center px-5"
        style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-glow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-text leading-none tracking-tight">Scramble</p>
            <p className="text-[10px] text-text-muted leading-none mt-0.5 font-medium">Marketing Hub</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
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

      {/* User */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(0, 0, 0, 0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white">G</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-text leading-none">Gabriel</p>
            <p className="text-[11px] text-text-dim leading-none mt-0.5">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
