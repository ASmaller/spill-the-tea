import { TeaPhoto } from "@/components/brand/TeaPhoto";
import { Tea } from "@/generated/prisma/client";
import { FOCUS_RING } from "@/lib/styles";
import { Check } from "lucide-react";

type Props = {
  tea: Tea;
  onOpen: (tea: Tea) => void;
  rated: boolean;
  compact?: boolean;
};

export function OptionCard({ tea, onOpen, rated, compact }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen(tea)}
      className={`group border-ink/6 bg-paper flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[18px] border text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-transform select-none active:scale-[0.99] ${FOCUS_RING.cream}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <TeaPhoto
        color={"var(--color-tea)"}
        pattern={0}
        height={compact ? 110 : 130}
        className="shrink-0"
      >
        {rated && (
          <span
            className="bg-tea text-paper animate-check-pop absolute top-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-full"
            aria-label="Rated"
          >
            <Check size={14} strokeWidth={3} aria-hidden />
          </span>
        )}
      </TeaPhoto>
      <div className="flex flex-1 items-start px-3.5 pt-3 pb-3.5">
        <h3
          className="text-ink font-serif"
          style={{
            fontSize: compact ? 17 : 19,
            letterSpacing: -0.2,
            lineHeight: 1.15,
          }}
        >
          {tea.name}
        </h3>
      </div>
    </button>
  );
}
