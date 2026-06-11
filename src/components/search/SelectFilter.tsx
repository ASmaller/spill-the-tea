import { FOCUS_RING } from "@/lib/styles";
import type { ReactNode } from "react";

type Props<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  children: ReactNode;
};

const SIZES = {
  sm: { padding: "5px 8px", borderRadius: 6 },
  md: { padding: "7px 10px", borderRadius: 7 },
} as const;

export function SelectFilter<T extends string>({
  label,
  value,
  onChange,
  size = "md",
  children,
}: Props<T>) {
  return (
    <div
      className="text-ink-soft text-meta flex items-center font-medium"
      style={{ gap: 6 }}
    >
      <span>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className={`bg-paper border-ink/[0.10] text-ink text-meta cursor-pointer border ${FOCUS_RING.paper}`}
        style={{ ...SIZES[size], fontFamily: "inherit" }}
      >
        {children}
      </select>
    </div>
  );
}
