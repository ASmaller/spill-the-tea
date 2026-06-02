import { DistSpark } from "@/components/admin/charts/DistSpark";
import { MealThumb } from "@/components/admin/MealThumb";
import { Pill } from "@/components/admin/Pill";
import { CupRating } from "@/components/brand/CupRating";
import { ratingColor } from "@/lib/admin/colors";
import type { TeaStat } from "@/lib/admin/types";
import { FOCUS_RING } from "@/lib/styles";
import Link from "next/link";

type Props = { tea: TeaStat; urlPrefix: string };

export function TeaCard({ tea, urlPrefix }: Props) {
  return (
    <Link
      href={urlPrefix + tea.id}
      className={`bg-paper border-ink/[0.06] flex flex-col overflow-hidden border transition-shadow hover:shadow-[0_4px_18px_rgba(26,24,21,0.10)] ${FOCUS_RING.cream}`}
      style={{ borderRadius: 12 }}
    >
      {tea.photo?.url && (
        <div
          className="w-full overflow-hidden"
          style={{ aspectRatio: "4 / 3" }}
        >
          <MealThumb meal={tea} />
        </div>
      )}
      <div className="flex flex-1 flex-col" style={{ padding: 12, gap: 8 }}>
        <div>
          <div
            className="text-ink text-body font-semibold"
            style={{ lineHeight: 1.3 }}
          >
            {tea.name}
          </div>
          {tea.tags.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: 4, marginTop: 6 }}>
              {tea.tags.map(t => (
                <Pill key={t} tone="neutral">
                  {t}
                </Pill>
              ))}
            </div>
          )}
        </div>

        {tea.rating != null ? (
          <div
            className="flex items-center justify-between"
            style={{ marginTop: 2 }}
          >
            <div className="flex items-baseline" style={{ gap: 6 }}>
              <span
                className="text-section font-serif"
                style={{ color: ratingColor(tea.rating), lineHeight: 1 }}
              >
                {tea.rating.toFixed(1)}
              </span>
              <CupRating value={Math.round(tea.rating)} size={9} />
            </div>
            <DistSpark dist={tea.distribution} />
          </div>
        ) : (
          <div
            className="text-amber bg-amber/10 text-meta text-center font-medium"
            style={{ padding: "6px 10px", borderRadius: 6 }}
          >
            Unrated
          </div>
        )}

        <div
          className="border-ink/[0.06] text-ink-soft text-tiny flex flex-wrap items-center justify-between border-t"
          style={{ paddingTop: 8, gap: 8 }}
        >
          <span className="tabular-nums">
            {tea.rating != null ? `${tea.votes} votes` : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}
