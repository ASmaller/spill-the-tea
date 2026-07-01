"use server";

import { Prisma, Tag } from "@/generated/prisma/client";
import { TagCreateInput, TagUpdateInput } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";

export async function getTags(): Promise<Tag[] | null> {
  return prisma.tag.findMany({});
}

async function runTagMutation<T>(
  operation: () => Promise<T>
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2025" || error.code === "P2002")
    ) {
      return null;
    }

    throw error;
  }
}

export async function deleteTag(id: string): Promise<Tag | null> {
  return runTagMutation(() =>
    prisma.tag.delete({
      where: {
        id,
      },
    })
  );
}

export async function addTag(tag: TagCreateInput): Promise<Tag | null> {
  return runTagMutation(() =>
    prisma.tag.create({
      data: {
        name: tag.name,
        color: tag.color,
      },
    })
  );
}

export async function updateTag(
  id: string,
  data: TagUpdateInput
): Promise<Tag | null> {
  return runTagMutation(() =>
    prisma.tag.update({
      where: {
        id,
      },
      data,
    })
  );
}
