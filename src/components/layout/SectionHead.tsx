import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
};

export function SectionHead({ title, sub, right }: Props) {
  return (
    <div
      className="flex items-baseline justify-between gap-3"
      style={{ marginBottom: 14 }}
    >
      <div>
        <div className="text-ink text-section font-serif">{title}</div>
        {sub && (
          <div className="text-ink-muted text-meta" style={{ marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}
