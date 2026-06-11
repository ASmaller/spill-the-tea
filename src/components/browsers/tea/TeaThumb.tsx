import { Pill } from "@/components/primitives/Pill";
import type { TeaStat } from "@/lib/types";
import Image from "next/image";

export enum TriedStatus {
  TRIED,
  UNTRIED,
}

type Props = {
  tea: Pick<TeaStat, "name" | "photo">;
  tried?: TriedStatus;
};

export function TeaThumb({ tea, tried }: Props) {
  if (!tea.photo?.url) return null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        src={tea.photo.url}
        alt={tea.name}
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
