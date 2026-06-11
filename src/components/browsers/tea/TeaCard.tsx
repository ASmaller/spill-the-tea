import { TeaThumb } from "@/components/browsers/tea/TeaThumb";
import { Pill } from "@/components/primitives/Pill";
import { CupRating } from "@/components/rating/CupRating";
import { DistSpark } from "@/components/statistics/charts/DistSpark";
import { ratingColor } from "@/lib/admin/colors";
import { FOCUS_RING } from "@/lib/styles";
import type { TeaStat } from "@/lib/types";
import Link from "next/link";

type Props = {
  tea: TeaStat;
  urlPrefix: string;
  onClick?: (id: string) => void;
};

export function TeaCard({ tea, urlPrefix, onClick }: Props) {
  return (
    <Link
      href={urlPrefix + tea.id}
      onClick={e => {
        e.stopPropagation();
      }}
      className="text-ink text-body/1.3 font-semibold"
    >
      <div
        // ...(onClick && { onClick })
        onClick={() => onClick?.(tea.id)}
        className={`bg-paper border-ink/[0.06] flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-[0_4px_18px_rgba(26,24,21,0.10)] ${FOCUS_RING.cream}`}
      >
        {tea.photo?.url && (
          <div className="aspect-4/3 w-full overflow-hidden">
            <TeaThumb tea={tea} />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div>
            {tea.name}
            {tea.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tea.tags.map(t => (
                  <Pill key={t} tone="neutral">
                    {t}
                  </Pill>
                ))}
              </div>
            )}
          </div>

          {tea.rating != null ? (
            <div className="mt-0.5 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-section font-serif"
                  style={{ color: ratingColor(tea.rating) }}
                >
                  {tea.rating.toFixed(1)}
                </span>
                <CupRating value={Math.round(tea.rating)} size={9} />
              </div>
              <DistSpark dist={tea.distribution} />
            </div>
          ) : (
            <div className="text-amber bg-amber/10 text-meta rounded-md px-1 py-2 text-center font-medium">
              Unrated
            </div>
          )}

          <div className="border-ink/[0.06] text-ink-soft text-tiny flex flex-wrap items-center justify-between gap-2 border-t pt-2">
            <span className="tabular-nums">{tea.votes} votes</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
