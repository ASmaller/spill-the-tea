type Props = {
  color: string;
  pattern: number;
  height: number;
  className?: string;
  children?: React.ReactNode;
};

export function TeaPhoto({
  color,
  pattern,
  height,
  className,
  children,
}: Props) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        height,
        background: `radial-gradient(circle at 30% 30%, ${color}, ${color}dd 60%, ${color}99)`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(${pattern}deg, rgba(255,255,255,0.12) 0 6px, transparent 6px 14px)`,
        }}
      />
      {children}
    </div>
  );
}
