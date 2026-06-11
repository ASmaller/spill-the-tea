export interface Props {
  label: string;
  children: React.ReactNode;
}

export function FilterRow({ label, children }: Props) {
  return (
    <div
      className="flex flex-wrap items-center"
      style={{ gap: 14, marginTop: 12 }}
    >
      <div
        className="text-ink-soft text-eyebrow uppercase"
        style={{ width: 48 }}
      >
        {label}
      </div>
      <div className="flex flex-wrap" style={{ gap: 6 }}>
        {children}
      </div>
    </div>
  );
}
