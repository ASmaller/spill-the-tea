import type { TeaStat } from "@/lib/admin/types";
import Image from "next/image";
import { Pill } from "./Pill";

export enum TriedStatus {
  UNSET,
  TRIED,
  UNTRIED,
}

type Props = {
  meal: Pick<TeaStat, "name" | "photo" | "tags">;
  tried: TriedStatus;
};

export function MealThumb({ meal, tried }: Props) {
  if (!meal.photo?.url) return null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        src={meal.photo.url}
        alt={meal.name}
        fill
        sizes="(max-width: 768px) 50vw, 240px"
        className="object-cover"
      />
      {tried == TriedStatus.UNTRIED && (
        <div className="absolute" style={{ top: 8, left: 8 }}>
          <Pill tone="warn">UNTRIED</Pill>
        </div>
      )}
    </div>
  );
}
