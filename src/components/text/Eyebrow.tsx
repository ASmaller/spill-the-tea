type Props = {
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
};

const SIZES = {
  sm: { fontSize: 10, letterSpacing: 1.2 },
  md: { fontSize: 11, letterSpacing: 1.4 },
} as const;

export function Eyebrow({ children, size = "md", className }: Props) {
  return (
    <span
      className={`text-ink-soft font-semibold uppercase ${className ?? ""}`}
      style={SIZES[size]}
    >
      {children}
    </span>
  );
}
