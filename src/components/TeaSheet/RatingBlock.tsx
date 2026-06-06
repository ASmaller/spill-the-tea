"use client";

import { CupRating } from "@/components/brand/CupRating";
import { Eyebrow } from "@/components/brand/Eyebrow";
import { FOCUS_RING } from "@/lib/styles";
import { NEGATIVE_TAGS, POSITIVE_TAGS } from "@/lib/types";
import { addReview } from "@/services/reviewService";
import { TeaDetail } from "@/services/statisticsService";
import { useState } from "react";

type Props = {
  tea: TeaDetail;
};

export function RatingBlock({ tea }: Props) {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState("");

  const toggleTag = (t: string) => {
    setTags(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const suggested = rating >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS;

  function updateRating(newRating: number) {
    return rating == newRating ? setRating(0) : setRating(newRating);
  }

  return (
    <div className="border-ink/6 bg-paper mt-3.5 rounded-[16px] border p-[18px]">
      <h3
        className="text-ink text-center font-serif"
        style={{ fontSize: 20, letterSpacing: -0.2 }}
      >
        How was it?
      </h3>
      <div className="mt-3.5 flex justify-center">
        <CupRating
          value={rating}
          size={46}
          interactive
          onChange={updateRating}
        />
      </div>

      {rating > 0 && (
        <div className="animate-dst-fade mt-4">
          <Eyebrow size="sm" className="mb-2 block">
            {rating >= 4 ? "What did you like about the tea?" : "What was off?"}
            <span
              className="text-ink-muted ml-1.5 font-normal normal-case"
              style={{ letterSpacing: 0 }}
            >
              · optional
            </span>
          </Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {[...suggested].map(t => {
              const on = tags.has(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  aria-pressed={on}
                  className={`rounded-full transition-colors ${FOCUS_RING.paper} ${
                    on
                      ? "bg-ink text-paper border-ink border font-semibold"
                      : "border-ink/15 text-ink border bg-transparent font-medium"
                  }`}
                  style={{ fontSize: 12, padding: "7px 12px" }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment… (optional)"
            rows={2}
            className="border-ink/10 bg-cream text-ink mt-3 w-full resize-none rounded-[12px] border px-3 py-2.5 outline-none"
            style={{ fontSize: 16, lineHeight: 1.4 }}
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          addReview({
            rating,
            comment,
            tags: Array.from(tags.values()),
            tea: {
              connect: {
                id: tea.id,
              },
            },
          });
          setRating(0);
          setTags(new Set());
          setComment("");
        }}
        disabled={rating === 0}
        className={`w-full rounded-[14px] font-semibold transition-colors ${FOCUS_RING.cream} ${
          rating > 0
            ? "bg-ink text-paper cursor-pointer"
            : "bg-ink/10 text-ink-muted cursor-not-allowed"
        }`}
        style={{ fontSize: 14, padding: "15px" }}
      >
        {rating > 0 ? "Submit rating" : "Tap a cup to rate"}
      </button>
    </div>
  );
}
