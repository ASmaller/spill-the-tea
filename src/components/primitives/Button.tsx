import { FOCUS_RING } from "@/lib/styles";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const BASE =
  "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[9px] text-meta font-medium cursor-pointer transition-colors";
const PRIMARY = "bg-ink text-paper border-0 hover:bg-ink/90";
const PRIMARY_DANGER = "bg-rose text-paper border-0 hover:bg-rose-deep";
const DEFAULT =
  "bg-transparent text-ink border-ink/[0.10] border hover:bg-ink/5";
const DEFAULT_DANGER =
  "bg-transparent text-rose border-rose/30 border hover:bg-rose/5";

function variant(primary?: boolean, danger?: boolean): string {
  if (danger && primary) return PRIMARY_DANGER;
  if (danger) return DEFAULT_DANGER;
  if (primary) return PRIMARY;
  return DEFAULT;
}

function assemble(v: string, extra?: string): string {
  return [BASE, v, FOCUS_RING.cream, extra].filter(Boolean).join(" ");
}

export function buttonClassName(primary?: boolean, extra?: string): string {
  return assemble(variant(primary, false), extra);
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
  ...rest
}: Props) {
  return (
    <button {...rest} className={assemble(variant(primary, danger), className)}>
      {children}
    </button>
  );
}
