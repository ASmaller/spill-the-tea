import { useId } from "react";

type Props = {
  size?: number;
  fill?: number;
  color?: string;
  accent?: string;
};

export function TeaCup({
  size = 24,
  fill = 0.6,
  color = "var(--color-tea)",
  accent = "var(--color-amber)",
}: Props) {
  const f = Math.max(0, Math.min(1, fill));
  const clipId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{ display: "block" }}
      aria-hidden
    >
      <path
        d="M 10 12 C 12 9.5 8 6.5 10 4"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M 14 11 C 16 8 12 5 14 2"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M 18 12 C 16 9.5 20 6.5 18 4"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      <path
        d="M 22 16 C 25.5 16 25.5 22 21.3 22"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      <clipPath id={clipId}>
        <path d="M 6 14 H 22 L 21 26 Q 20.5 27 19.5 27 H 8.5 Q 7.5 27 7 26 Z" />
      </clipPath>
      <rect
        x="5"
        y={14 + 13 * (1 - f)}
        width="18"
        height="14"
        fill={accent}
        clipPath={`url(#${clipId})`}
      />

      <path
        d="M 6 14 H 22 L 21 26 Q 20.5 27 19.5 27 H 8.5 Q 7.5 27 7 26 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
