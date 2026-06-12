"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export async function uploadTeaImage(file: File): Promise<string> {
  const extension = IMAGE_EXTENSIONS[file.type];

  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  if (file.size <= 0) {
    throw new Error("The selected image is empty.");
  }

  const uploadDirectory = path.join(process.cwd(), "public", "tea");
  const filename = `${randomUUID()}${extension}`;
  const targetPath = path.join(uploadDirectory, filename);

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

  return `/tea/${filename}`;
}
