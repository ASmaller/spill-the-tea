import { FOCUS_RING } from "@/lib/styles";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const BASE =
  "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[9px] text-meta font-medium transition-colors";
const PRIMARY = "bg-ink text-paper border-0 hover:bg-ink/90 cursor-pointer";
const PRIMARY_DISABLED = "bg-ink/20 text-paper/80 border-0 cursor-not-allowed";
const PRIMARY_DANGER =
  "bg-rose text-paper border-0 hover:bg-rose-deep cursor-pointer";
const DEFAULT =
  "bg-transparent text-ink border-ink/10 border hover:bg-ink/5 cursor-pointer";
const DEFAULT_DISABLED =
  "bg-transparent text-ink/50 border-ink/10 border cursor-not-allowed";
const DEFAULT_DANGER =
  "bg-transparent text-rose border-rose/30 border hover:bg-rose/5 cursor-pointer";

function variant(
  primary?: boolean,
  danger?: boolean,
  disabled?: boolean
): string {
  if (disabled && primary) return PRIMARY_DISABLED;
  if (disabled) return DEFAULT_DISABLED;
  if (danger && primary) return PRIMARY_DANGER;
  if (danger) return DEFAULT_DANGER;
  if (primary) return PRIMARY;
  return DEFAULT;
}

function assemble(v: string, extra?: string): string {
  return [BASE, v, FOCUS_RING.cream, extra].filter(Boolean).join(" ");
}

export function buttonClassName(
  primary?: boolean,
  danger?: boolean,
  disabled?: boolean,
  extra?: string
): string {
  return assemble(variant(primary, danger, disabled), extra);
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
  danger?: boolean;
  children: ReactNode;
};

export function Button({
  primary,
  danger,
  children,
  className,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={buttonClassName(primary, danger, disabled, className)}
    >
      {children}
    </button>
  );
}
