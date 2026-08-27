"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-8"
      style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      <div>
        <h1 className="text-base font-bold text-text tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-text-muted font-medium">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}
