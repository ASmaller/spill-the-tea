import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  padding?: number;
  className?: string;
  style?: CSSProperties;
};

export function Card({ children, padding = 20, className, style }: Props) {
  return (
    <div
      className={`bg-paper border-ink/[0.06] rounded-[14px] border ${className ?? ""}`}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}
