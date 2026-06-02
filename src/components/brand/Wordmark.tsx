type Props = {
  size?: number;
};

export function Wordmark({ size = 22 }: Props) {
  return (
    <span
      className="text-ink inline-flex items-baseline font-serif italic"
      style={{
        fontSize: size,
        lineHeight: 1,
        letterSpacing: -0.3,
        gap: size * 0.18,
      }}
    >
      <span className="text-amber">Spill</span>
      <span>the Tea</span>
    </span>
  );
}
