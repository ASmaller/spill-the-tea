import { FOCUS_RING } from "@/lib/styles";
import { submitSuggestion } from "@/services/suggestionService";
import { useEffect, useRef, useState } from "react";
import { ThankYouView } from "../sheet/ThankYouView";
import { Card } from "../ui/Card";

const SUBMIT_CLOSE_DELAY = 1600;

export function SuggestForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isComplete = title && description;
  const buttonLabel = isComplete
    ? "Submit suggestion"
    : "Complete form to submit";

  const submitTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }
    },
    []
  );

  const handleSubmit = async (formData: FormData): Promise<void> => {
    if (submitted) return;
    if (submitted || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    await submitSuggestion(formData)
      .then(() => {
        setSubmitted(true);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(10);
        }

        setTitle("");
        setDescription("");

        submitTimerRef.current = window.setTimeout(() => {
          submitTimerRef.current = null;
          setSubmitted(false);
        }, SUBMIT_CLOSE_DELAY);
      })
      .catch(reason => {
        if (reason instanceof Error) {
          setError(`Failed to submit: ${reason.message}`);
        } else {
          setError("Something went wrong, try again later");
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Card className="relative m-4 min-h-64">
      <form
        action={handleSubmit}
        className={`transition-opacity duration-200 ease-out ${submitted ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <div className="flex flex-col">
          <label htmlFor="title" className="text-l font-serif">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value.trim())}
            name="title"
            placeholder="What I want is..."
            className="border-ink/10 bg-cream text-ink mt-1 w-full rounded-[12px] border px-3 py-2.5 outline-none"
          />

          <label htmlFor="description" className="text-l mt-4 font-serif">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value.trim())}
            name="description"
            placeholder="I want this because..."
            rows={4}
            className="border-ink/10 bg-cream text-ink mt-1 w-full resize-none rounded-[12px] border px-3 py-2.5 outline-none"
          />

          <div className="mt-6">
            {error && (
              <p className="text-meta text-rose-deep mb-2 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!isComplete || isSubmitting}
              className={`text-body w-full rounded-[14px] p-2 font-semibold transition-colors ${FOCUS_RING.cream} ${
                isComplete
                  ? "bg-ink text-paper cursor-pointer"
                  : "bg-ink/10 text-ink-muted cursor-not-allowed"
              }`}
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </form>

      {submitted && <ThankYouView rating={5} label="You left a suggestion" />}
    </Card>
  );
}
