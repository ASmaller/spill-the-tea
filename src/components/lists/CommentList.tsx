"use client";

import { CupRating } from "@/components/inputs/CupRating";
import { SectionHead } from "@/components/layout/SectionHead";
import { Pill } from "@/components/primitives/Pill";
import { SelectFilter } from "@/components/search/SelectFilter";
import { Prisma } from "@/generated/prisma/client";
import { formatRelativeDate } from "@/lib/dateFormat";
import { FOCUS_RING } from "@/lib/styles";
import { useMemo, useState } from "react";

type Props = {
  reviews: Prisma.ReviewGetPayload<{
    include: {
      user: {
        select: {
          name: true;
        };
      };
    };
  }>[];
  pageSize?: number;
};

type SortKey = "recent" | "highest" | "lowest";

export function CommentList({ reviews, pageSize = 5 }: Props) {
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const next = [...reviews];
    if (sort === "recent") {
      next.sort((a, b) => b.posted.getTime() - a.posted.getTime());
    }
    if (sort === "highest") next.sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") next.sort((a, b) => a.rating - b.rating);
    return next;
  }, [reviews, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  return (
    <>
      <SectionHead
        title="All comments"
        sub={`${reviews.length} on this tea`}
        right={
          <div className="flex items-center" style={{ gap: 10 }}>
            <SelectFilter
              label="Sort"
              value={sort}
              size="sm"
              onChange={next => {
                setSort(next);
                setPage(1);
              }}
            >
              <option value="recent">Most recent</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
            </SelectFilter>
            <div className="bg-ink/[0.10]" style={{ width: 1, height: 18 }} />
            <div className="flex items-center" style={{ gap: 4 }}>
              <PageBtn
                disabled={safePage === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                label="Previous page"
              >
                ‹
              </PageBtn>
              <span
                className="text-ink-soft text-meta tabular-nums"
                style={{ padding: "0 4px" }}
              >
                {safePage} / {totalPages}
              </span>
              <PageBtn
                disabled={safePage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                label="Next page"
              >
                ›
              </PageBtn>
            </div>
          </div>
        }
      />
      {visible.length === 0 ? (
        <div className="text-ink-soft text-meta flex items-center justify-center p-4">
          No comments yet.
        </div>
      ) : (
        visible.map((review, i) => (
          <div
            key={review.id}
            style={{
              padding: "12px 0",
              borderTop: i === 0 ? "none" : "1px solid rgba(26,24,21,0.06)",
            }}
          >
            <div
              className="flex items-center"
              style={{ gap: 8, marginBottom: 5 }}
            >
              <CupRating value={review.rating} size={11} disabled />
              {review.user?.name && (
                <span className="text-ink text-meta">{review.user.name}</span>
              )}
              <span className="text-ink-soft text-meta">
                {formatRelativeDate(review.posted)}
              </span>
            </div>
            {review.comment && (
              <div
                className="text-ink text-body italic"
                style={{ lineHeight: 1.5 }}
              >
                &ldquo;{review.comment}&rdquo;
              </div>
            )}
            {review.tags.length > 0 && (
              <div className="flex flex-wrap" style={{ gap: 4, marginTop: 6 }}>
                {review.tags.map(t => (
                  <Pill key={t} tone="neutral">
                    {t}
                  </Pill>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
}

function PageBtn({
  disabled,
  onClick,
  children,
  label,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`bg-paper border-ink/[0.10] text-ink text-body flex items-center justify-center border disabled:opacity-40 ${FOCUS_RING.paper}`}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
