"use server";

import { unlink, writeFile } from "fs";
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
    unlink(filePath, err => {
      if (err) {
        console.log(err);
      }
    });
  }

  return tea;
}

export async function addTea(tea: TeaCreateInput): Promise<Tea> {
  return prisma.tea.create({
    data: {
      name: tea.name,
      description: tea.description ?? Prisma.skip,
      tags: tea.tags,
      image: tea.image ?? Prisma.skip,
    },
  });
}

export async function uploadImage(file: File): Promise<string> {
  // TODO: validate file type and size

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "tea");
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer, err => {
      if (err) {
        console.log(err);
      }
    });
    console.log("");

    return `/tea/${file.name}`;
  } catch (error) {
    console.error("Upload error:", error);
    return "";
  }
}

export async function updateTea(
  id: string,
  data: TeaUpdateInput
): Promise<Tea> {
  return prisma.tea.update({
    where: {
      id,
    },
    data,
  });
}
