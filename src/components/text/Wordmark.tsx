type Props = {
  className?: string;
};

export function Wordmark({ className }: Props) {
  return (
    <span
      className={
        "text-ink inline-flex items-baseline font-serif tracking-tight italic " +
        className
      }
    >
      <span className="text-tea">Spill &nbsp;</span>
      <span>the Tea</span>
    </span>
  );
}
