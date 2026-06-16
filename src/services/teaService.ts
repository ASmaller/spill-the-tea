"use server";

import { rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { Prisma, Tea } from "@/generated/prisma/client";
import { TeaCreateInput, TeaUpdateInput } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";

export async function getTeas(take?: number): Promise<Tea[] | null> {
  return prisma.tea.findMany({
    take,
  });
}

export async function getTeaById(id: string): Promise<Tea | null> {
  return prisma.tea.findUnique({
    where: { id },
  });
}

export async function deleteTeaById(id: string): Promise<Tea | null> {
  const tea = await prisma.tea.delete({
    where: { id },
  });

  if (tea.image) {
    await unlinkImage(tea.image);
  }

  return tea;
}

export async function addTea(tea: TeaCreateInput, file?: File): Promise<Tea> {
  const image = file ? await uploadImage(file, tea.name) : Prisma.skip;

  const res = await prisma.tea.create({
    data: {
      name: tea.name,
      description: tea.description ?? Prisma.skip,
      tags: tea.tags,
      image,
    },
  });
  return res;
}

function toSafeFileStem(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "") || "tea"
  );
}

async function uploadImage(file: File, name: string): Promise<string> {
  const IMAGE_EXTENSIONS: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };
  const extension = IMAGE_EXTENSIONS[file.type];

  if (!extension) {
    throw new Error(
      "Unsupported image type. Supported types are: .jpg, .png, .webp, .gif, and .avif"
    );
  }

  if (file.size <= 0) {
    throw new Error("The selected image is empty.");
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${toSafeFileStem(name)}-${Date.now()}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "tea");
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    return `/tea/${filename}`;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Could not upload the selected image.");
  }
}

async function unlinkImage(name: string): Promise<boolean> {
  try {
    const uploadDir = path.join(process.cwd(), "public");
    const filePath = path.join(uploadDir, name);
    await unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function updateTea(
  id: string,
  data: TeaUpdateInput,
  file?: File
): Promise<Tea> {
  const tea = await getTeaById(id);
  if (file && tea) {
    if (tea.image) {
      await unlinkImage(tea.image);
    }
    const filename = typeof data.name == "string" ? data.name : tea.name;
    data.image = await uploadImage(file, filename);
  }

  if (typeof data.name == "string" && tea && !file) {
    if (tea.image) {
      const uploadDir = path.join(process.cwd(), "public");
      const extension = path.extname(tea.image) || ".jpg";
      const filename = `${toSafeFileStem(data.name)}-${Date.now()}${extension}`;

      const oldDir = path.join(uploadDir, tea?.image);
      const newDir = path.join(uploadDir, "tea", filename);
      await rename(oldDir, newDir);
      data.image = `/tea/${filename}`;
    }
  }

  const res = await prisma.tea.update({
    where: {
      id,
    },
    data,
  });

  return res;
}
