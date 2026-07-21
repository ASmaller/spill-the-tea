"use server";

import { rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { Prisma, Tea } from "@/generated/prisma/client";
import { TeaUpdateInput } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";

export type TeaFormValues = {
  name: string;
  description?: string;
  tags?: string[];
};

export async function getTeas(take?: number): Promise<Tea[] | null> {
  return prisma.tea.findMany({
    take,
  });
}

export type TeaWithTags = Prisma.TeaGetPayload<{
  include: {
    tags: {
      select: {
        id: true;
        name: true;
        color: true;
      };
    };
  };
}>;

export async function getTeaById(id: string): Promise<TeaWithTags | null> {
  return prisma.tea.findUnique({
    where: { id },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          color: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
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

export async function addTea(tea: TeaFormValues, file?: File): Promise<Tea> {
  const image = file ? await uploadImage(file, tea.name) : Prisma.skip;
  const tagConnections = tea.tags?.length
    ? {
        connect: tea.tags.map(tagName => ({ name: tagName })),
      }
    : undefined;

  const res = await prisma.tea.create({
    data: {
      name: tea.name,
      description: tea.description ?? Prisma.skip,
      image,
      ...(tagConnections ? { tags: tagConnections } : {}),
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
  data: TeaFormValues,
  file?: File
): Promise<Tea> {
  const tea = await getTeaById(id);
  const updateData: TeaUpdateInput = {
    name: data.name,
    ...(data.description !== undefined
      ? { description: data.description }
      : {}),
  };

  let uploadedImagePath: string | null = null;
  let renameTarget: { oldDir: string; newDir: string } | null = null;

  try {
    if (file && tea) {
      uploadedImagePath = await uploadImage(file, data.name);
      updateData.image = uploadedImagePath;
    }

    if (tea && !file) {
      if (tea.image && tea.name !== data.name) {
        const uploadDir = path.join(process.cwd(), "public");
        const extension = path.extname(tea.image) || ".jpg";
        const filename = `${toSafeFileStem(data.name)}-${Date.now()}${extension}`;

        const oldDir = path.join(uploadDir, tea.image);
        const newDir = path.join(uploadDir, "tea", filename);
        renameTarget = { oldDir, newDir };
        updateData.image = `/tea/${filename}`;
      }
    }

    if (data.tags !== undefined) {
      updateData.tags =
        data.tags.length > 0
          ? { set: data.tags.map(tagName => ({ name: tagName })) }
          : { set: [] };
    }

    const res = await prisma.tea.update({
      where: {
        id,
      },
      data: updateData,
    });

    if (file && tea?.image) {
      await unlinkImage(tea.image);
    }

    if (renameTarget) {
      await rename(renameTarget.oldDir, renameTarget.newDir);
    }

    return res;
  } catch (error) {
    if (uploadedImagePath) {
      await unlinkImage(uploadedImagePath);
    }

    throw error;
  }
}
