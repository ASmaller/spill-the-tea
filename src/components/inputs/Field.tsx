import type { CSSProperties, ReactNode } from "react";

type Props = {
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  style?: CSSProperties;
};

export function Field({
  label,
  hint,
  required,
  htmlFor,
  children,
  style,
}: Props) {
  return (
    <div className="flex flex-col" style={{ gap: 6, ...style }}>
      <label
        htmlFor={htmlFor}
        className="text-ink-muted font-semibold uppercase"
        style={{ fontSize: 11, letterSpacing: 1 }}
      >
        {label}
        {required && (
          <span className="text-rose" style={{ marginLeft: 4 }}>
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <div
          className="text-ink-soft"
          style={{ fontSize: 11, lineHeight: 1.4 }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
