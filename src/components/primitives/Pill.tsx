import type { CSSProperties, ReactNode } from "react";

export type PillTone =
  | "good"
  | "warn"
  | "bad"
  | "tea"
  | "neutral"
  | "tea-light";

export type PillShape = "round" | "square";
export type PillSize = "sm" | "md";

const TONE: Record<PillTone, string> = {
  good: "bg-sage/20 text-tea",
  warn: "bg-amber/20 text-amber-deep",
  bad: "bg-rose/20 text-rose-deep",
  tea: "bg-tea/10 text-tea",
  neutral: "bg-ink/[0.06] text-ink-muted",
  "tea-light": "bg-tea-light/15 text-tea",
};

const SHAPE: Record<PillShape, string> = {
  round: "rounded-full",
  square: "rounded-[4px]",
};

// `sm` is the small-caps badge variant used inside cards. `md` is the default chip used in lists and headers.
const SIZE_STYLE: Record<PillSize, CSSProperties> = {
  md: { fontSize: 11, padding: "3px 8px", letterSpacing: 0, lineHeight: 1.4 },
  sm: {
    fontSize: 10,
    padding: "2px 7px",
    letterSpacing: 0.4,
    lineHeight: 1.3,
    textTransform: "uppercase",
  },
};

type Props = {
  tone?: PillTone;
  shape?: PillShape;
  size?: PillSize;
  color?: string;
  children: ReactNode;
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "").trim();

  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map(char => char + char)
          .join("")
      : normalized;

  const value = Number.parseInt(expanded, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Pill({
  tone = "neutral",
  shape = "round",
  size = "md",
  color,
  children,
}: Props) {
  const customStyle = color
    ? {
        backgroundColor: hexToRgba(color, 0.16),
        color,
        boxShadow: `inset 0 0 0 1px ${hexToRgba(color, 0.28)}`,
      }
    : undefined;

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold whitespace-nowrap ${SHAPE[shape]} ${TONE[tone]}`}
      style={{ ...SIZE_STYLE[size], ...customStyle }}
    >
      {children}
    </span>
  );
}
