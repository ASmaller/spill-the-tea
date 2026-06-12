import { TeaCup } from "@/components/icons/TeaCup";

type Props = {
  value?: number;
  size?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
};

export function CupRating({
  value = 0,
  size = 28,
  disabled = false,
  onChange,
}: Props) {
  return (
    <div
      className="inline-flex"
      role={disabled ? undefined : "radiogroup"}
      aria-label={disabled ? undefined : "Rating"}
      style={{ gap: size * 0.18 }}
    >
      {[1, 2, 3, 4, 5].map(i => {
        const fill = value >= i ? 1 : value >= i - 0.5 ? 0.5 : 0;
        if (disabled) {
          return <TeaCup key={i} size={size} fill={fill} />;
        }
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} cup${i === 1 ? "" : "s"}`}
            onClick={() => onChange?.(i)}
            className="cursor-pointer border-0 bg-transparent p-0 transition-transform active:scale-95"
          >
            <TeaCup size={size} fill={fill} />
          </button>
        );
      })}
    </div>
  );
}
