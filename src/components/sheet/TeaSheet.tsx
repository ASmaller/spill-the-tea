import { Eyebrow } from "@/components/brand/Eyebrow";
import { LinePill } from "@/components/brand/LinePill";
import { MealPhoto } from "@/components/brand/MealPhoto";
import { Tag } from "@/components/brand/Tag";
import { formatFeedDate } from "@/lib/dateFormat";
import { FOCUS_RING } from "@/lib/styles";
import type { RatingPayload } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { CupRating } from "../brand/CupRating";
import { ClimateTag } from "./ClimateTag";
import { RatingBlock } from "./RatingBlock";
import { ThankYouView } from "./ThankYouView";

const SUBMIT_CLOSE_DELAY = 1200;

function getButtonLabel(rating: number, hasExtras: boolean): string {
  if (rating === 0) return "Tap a cup to rate";
  if (hasExtras) return "Submit rating & comment";
  return "Submit rating";
}

type Props = {
  teaId: string | null;
  existingRating: number | null;
  onClose: () => void;
  onSubmit: (payload: RatingPayload) => void;
};

export function TeaSheet({ teaId, existingRating, onClose, onSubmit }: Props) {
  const open = teaId != null;
  const [display, setDisplay] = useState<{ option: Option; day: Day } | null>(
    null
  );

  // Cache the last non-null meal so content stays visible through the close
  // animation after the parent clears `option`. React sanctions this
  // "adjusting state from props" pattern when guarded against re-entry.
  if (option && day && (display?.option !== option || display?.day !== day)) {
    setDisplay({ option, day });
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={o => {
        if (!o) onClose();
      }}
      onAnimationEnd={isOpen => {
        if (!isOpen) setDisplay(null);
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="bg-ink/45 fixed inset-0 z-40 backdrop-blur-[4px]" />
        <Drawer.Content className="bg-cream fixed right-0 bottom-0 left-0 z-50 mt-24 flex max-h-[92dvh] flex-col rounded-t-[28px] shadow-[0_-8px_32px_rgba(0,0,0,0.2)] outline-none">
          <Drawer.Title className="sr-only">
            {display?.option.name ?? "Tea detail"}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Rate this tea and leave an optional comment.
          </Drawer.Description>

          <div className="bg-cream relative z-20 flex items-center justify-center rounded-t-[28px] px-4 pt-2.5 pb-2.5">
            <Drawer.Handle className="!bg-ink/15 !h-1 !w-[38px] !rounded-[2px]" />
          </div>

          {display &&
            (existingRating !== null ? (
              <ReadOnlyView
                key={display.option.id}
                option={display.option}
                day={display.day}
                rating={existingRating}
                onClose={onClose}
              />
            ) : (
              <EditableContent
                key={display.option.id}
                option={display.option}
                day={display.day}
                onSubmit={onSubmit}
              />
            ))}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

type EditableContentProps = {
  option: Option;
  day: Day;
  onSubmit: (payload: RatingPayload) => void;
};

function EditableContent({ option, day, onSubmit }: EditableContentProps) {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);
  const revealedRef = useRef(false);

  useEffect(() => {
    if (rating === 0 || revealedRef.current) return;
    revealedRef.current = true;
    const frame = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [rating]);

  const toggleTag = (t: string) => {
    setTags(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const hasExtras = tags.size > 0 || note.trim().length > 0;
  const buttonLabel = getButtonLabel(rating, hasExtras);

  const submitTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }
    },
    []
  );

  const handleSubmit = () => {
    if (rating === 0 || submitted) return;
    setSubmitted(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
    submitTimerRef.current = window.setTimeout(() => {
      submitTimerRef.current = null;
      onSubmit({
        optionId: option.id,
        dayId: day.id,
        rating,
        tags: [...tags],
        note: note.trim(),
      });
    }, SUBMIT_CLOSE_DELAY);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className={`flex min-h-0 flex-1 flex-col transition-opacity duration-200 ease-out ${
          submitted ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden={submitted}
      >
        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto"
          onScroll={e => {
            const next = e.currentTarget.scrollTop > 4;
            if (next === scrolledRef.current) return;
            scrolledRef.current = next;
            gradientRef.current?.classList.toggle("opacity-0", !next);
          }}
        >
          <div
            ref={gradientRef}
            aria-hidden
            className="from-cream pointer-events-none sticky top-0 z-10 -mb-5 h-5 bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-200"
          />
          <MealPhoto
            color={option.color}
            pattern={option.pattern}
            height={200}
            className="mx-4 mt-1 rounded-[20px]"
          >
            <LinePill className="absolute top-3 left-3" size="md">
              {option.line}
            </LinePill>
          </MealPhoto>

          <div className="px-5 pt-4.5">
            <Eyebrow>{formatFeedDate(day.date)}</Eyebrow>
            <h2
              className="text-ink mt-1 font-serif"
              style={{
                fontSize: 30,
                letterSpacing: -0.5,
                lineHeight: 1.08,
              }}
            >
              {option.name}
            </h2>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {option.tags.map(t => (
                <Tag key={t}>{t}</Tag>
              ))}
              <ClimateTag
                climate={option.climate}
                climateLabel={option.climateLabel}
              />
            </div>

            <p
              className="text-ink-muted mt-3.5"
              style={{ fontSize: 14, lineHeight: 1.5 }}
            >
              {option.desc}
            </p>

            <RatingBlock
              rating={rating}
              setRating={setRating}
              tags={tags}
              toggleTag={toggleTag}
              note={note}
              setNote={setNote}
            />
          </div>
        </div>

        <div
          className="border-ink/6 bg-cream border-t px-5 pt-3.5"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 22px)" }}
        >
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`w-full rounded-[14px] font-semibold transition-colors ${FOCUS_RING.cream} ${
              rating > 0
                ? "bg-ink text-paper cursor-pointer"
                : "bg-ink/10 text-ink-muted cursor-not-allowed"
            }`}
            style={{ fontSize: 14, padding: "15px" }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>

      {submitted && <ThankYouView rating={rating} />}
    </div>
  );
}

type ReadOnlyViewProps = {
  option: Option;
  day: Day;
  rating: number;
  onClose: () => void;
};

function ReadOnlyView({ option, day, rating, onClose }: ReadOnlyViewProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="relative flex-1 overflow-y-auto">
        <MealPhoto
          color={option.color}
          pattern={option.pattern}
          height={200}
          className="mx-4 mt-1 rounded-[20px]"
        >
          <LinePill className="absolute top-3 left-3" size="md">
            {option.line}
          </LinePill>
        </MealPhoto>

        <div className="px-5 pt-4.5">
          <Eyebrow>{formatFeedDate(day.date)}</Eyebrow>
          <h2
            className="text-ink mt-1 font-serif"
            style={{ fontSize: 30, letterSpacing: -0.5, lineHeight: 1.08 }}
          >
            {option.name}
          </h2>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {option.tags.map(t => (
              <Tag key={t}>{t}</Tag>
            ))}
            <ClimateTag
              climate={option.climate}
              climateLabel={option.climateLabel}
            />
          </div>

          <p
            className="text-ink-muted mt-3.5"
            style={{ fontSize: 14, lineHeight: 1.5 }}
          >
            {option.desc}
          </p>

          <div className="border-ink/6 bg-paper mt-3.5 rounded-[16px] border p-[18px]">
            <Eyebrow size="sm" className="block text-center">
              Your rating
            </Eyebrow>
            <div
              className="mt-3 flex justify-center"
              aria-label={`You rated ${rating} out of 5`}
            >
              <CupRating value={rating} size={46} />
            </div>
          </div>
        </div>
      </div>

      <div
        className="border-ink/6 bg-cream border-t px-5 pt-3.5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 22px)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className={`bg-ink/10 text-ink w-full cursor-pointer rounded-[14px] font-semibold transition-colors ${FOCUS_RING.cream}`}
          style={{ fontSize: 14, padding: "15px" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
