import { FOCUS_RING } from "@/lib/styles";

export interface Props {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}

export function Chip({ active, onClick, count, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-meta flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium ${
        active
          ? "bg-ink text-paper border-ink"
          : "bg-paper text-ink border-ink/[0.10]"
      } ${FOCUS_RING.paper}`}
      aria-pressed={active}
    >
      {children}
      {count != null && (
        <span
          className={`text-tiny tabular-nums ${
            active ? "text-paper/70" : "text-ink-soft"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
