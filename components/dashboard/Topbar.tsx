"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background: "rgba(7, 12, 18, 0.8)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(28, 42, 56, 0.7)",
      }}
    >
      <div>
        <h1 className="text-base font-semibold text-text leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs leading-tight" style={{ color: "var(--color-text-dim)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </header>
  );
}
