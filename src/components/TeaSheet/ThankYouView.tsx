import { CupRating } from "../brand/CupRating";

interface Props {
  rating: number;
  label?: string;
}

export function ThankYouView({ rating, label }: Props) {
  const base = 120;
  const step = 70;
  const delay = (i: number) => ({
    animationDelay: `${base + i * step}ms`,
    animationFillMode: "both" as const,
  });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <h2
        className="text-ink animate-thanks-in font-serif"
        style={{ fontSize: 40, letterSpacing: -0.5, ...delay(0) }}
      >
        Thanks
      </h2>
      <p
        className="text-ink-muted animate-thanks-in mt-1.5"
        style={{ fontSize: 14, lineHeight: 1.5, ...delay(1) }}
      >
        We heard you.
      </p>

      <div
        className="animate-thanks-in mt-7"
        style={delay(2)}
        aria-label={label ?? `You rated ${rating} out of 5`}
      >
        <CupRating value={rating} size={44} />
      </div>
    </div>
  );
}
