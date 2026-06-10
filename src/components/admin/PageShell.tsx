import type { ReactNode } from "react";

type Props = {
  backlink?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageShell({
  backlink,
  title,
  subtitle,
  actions,
  children,
}: Props) {
  return (
    <div
      className="bg-cream flex-1 overflow-auto"
      style={{ padding: "24px 28px" }}
    >
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <div className="text-ink text-display/8 font-serif">
            {backlink}
            {title}
          </div>
          {subtitle && (
            <div className="text-ink-muted text-body mt-2">{subtitle}</div>
          )}
        </div>
        {actions && (
          <div className="flex" style={{ gap: 8 }}>
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
