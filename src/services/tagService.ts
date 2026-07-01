"use server";

import { Tag } from "@/generated/prisma/client";
import { TagCreateInput, TagUpdateInput } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";

export async function getTags(): Promise<Tag[] | null> {
  return prisma.tag.findMany({});
}

export async function deleteTag(id: string): Promise<Tag | null> {
  return prisma.tag.delete({
    where: {
      id,
    },
  });
}

export async function addTag(tag: TagCreateInput): Promise<Tag | null> {
  return prisma.tag.create({
    data: {
      name: tag.name,
      color: tag.color,
    },
  });
}

export async function updateTag(
  id: string,
  data: TagUpdateInput
): Promise<Tag | null> {
  return prisma.tag.update({
    where: {
      id,
    },
    data,
  });
}
