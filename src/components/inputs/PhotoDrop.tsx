"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  square?: boolean;
  setFile: (file: File) => void;
};

export function PhotoDrop({ square, setFile }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const nextFile = event.target.files[0];

      setFile(nextFile);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(nextFile));
    }
  };

  return (
    <label
      id="dropZone"
      className="border-ink/18 bg-ink/2 relative flex w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed opacity-60"
    >
      <input
        type="file"
        onChange={handleChange}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <div
        className="flex w-full flex-wrap items-center justify-center"
        style={{
          aspectRatio: square ? "1 / 1" : "4 / 3",
          gap: 8,
        }}
      >
        {previewUrl ? (
          <Image
            fill={true}
            src={previewUrl}
            alt="Selected tea preview"
            className="h-full w-full object-cover"
            style={{ aspectRatio: square ? "1 / 1" : "4 / 3" }}
          />
        ) : (
          <>
            <div
              className="bg-ink/5 text-ink-muted flex items-center justify-center rounded-full"
              style={{ width: 36, height: 36 }}
            >
              <ImageIcon size={18} />
            </div>
            <div
              className="text-ink-muted font-medium"
              style={{ fontSize: 13 }}
            >
              Upload a photo
              <div
                className="text-ink-soft basis-full text-center"
                style={{ fontSize: 11 }}
              >
                .webp, .png, .jpg
              </div>
            </div>
          </>
        )}
      </div>
    </label>
  );
}
