"use server";

import { rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { Prisma, Tea } from "@/generated/prisma/client";
import { TeaCreateInput, TeaUpdateInput } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";
import { TeaWithReviews } from "@/lib/types";

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

export async function getTeaWithReviewsById(
  id: string
): Promise<TeaWithReviews | null> {
  return prisma.tea.findUnique({
    where: { id },
    include: {
      reviews: true,
    },
  });
}

export async function deleteTeaById(id: string): Promise<Tea | null> {
  const tea = await prisma.tea.delete({
    where: { id },
  });

  if (tea.image) {
    const uploadDir = path.join(process.cwd(), "public");
    const filePath = path.join(uploadDir, tea.image);
    await unlink(filePath);
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
    throw new Error("Unsupported image type.");
  }

  if (file.size <= 0) {
    throw new Error("The selected image is empty.");
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filenname = `${toSafeFileStem(name)}-${Date.now()}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "tea");
    const filePath = path.join(uploadDir, filenname);
    await writeFile(filePath, buffer);
    return `/tea/${filenname}`;
  } catch (error) {
    console.error("Upload error:", error);
    return "";
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
      const filenname = `${toSafeFileStem(data.name)}-${Date.now()}.${tea.image.split(".").pop()}`;

      const oldDir = path.join(uploadDir, tea?.image);
      const newDir = path.join(uploadDir, "tea", filenname);
      await rename(oldDir, newDir);
      data.image = `/tea/${filenname}`;
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
