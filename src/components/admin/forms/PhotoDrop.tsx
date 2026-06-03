"use client";

import type { PhotoRef } from "@/lib/types";
import { ImageIcon } from "lucide-react";

type Props = {
  value: PhotoRef | null;
  onChange: (next: PhotoRef | null) => void;
  square?: boolean;
};

export function PhotoDrop({ square }: Props) {
  return (
    <button
      type="button"
      disabled
      aria-label="Photo upload not yet supported"
      className="border-ink/[0.18] bg-ink/[0.02] relative flex w-full cursor-not-allowed flex-col items-center justify-center overflow-hidden rounded-[12px] border-2 border-dashed opacity-60"
      style={{
        aspectRatio: square ? "1 / 1" : "4 / 3",
        gap: 8,
      }}
    >
      <div
        className="bg-ink/5 text-ink-muted flex items-center justify-center rounded-full"
        style={{ width: 36, height: 36 }}
      >
        <ImageIcon size={18} />
      </div>
      <div className="text-ink-muted font-medium" style={{ fontSize: 13 }}>
        Photos not supported yet
      </div>
      <div className="text-ink-soft" style={{ fontSize: 11 }}>
        Coming soon
      </div>
    </button>
  );
}
