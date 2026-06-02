import { NEW_TAG } from "@/lib/admin/types";
import type { TeaStat } from "@/lib/admin/types";
import Image from "next/image";
import { Pill } from "./Pill";

type Props = {
  meal: Pick<TeaStat, "name" | "photo" | "tags">;
  showNewBadge?: boolean;
};

export function MealThumb({ meal, showNewBadge = true }: Props) {
  if (!meal.photo?.url) return null;

  const isNew = meal.tags.includes(NEW_TAG);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        src={meal.photo.url}
        alt={meal.name}
        fill
        sizes="(max-width: 768px) 50vw, 240px"
        className="object-cover"
      />
      {showNewBadge && isNew && (
        <div className="absolute" style={{ top: 8, left: 8 }}>
          <Pill tone="warn">NEW</Pill>
        </div>
      )}
    </div>
  );
}
