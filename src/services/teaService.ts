"use server";

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
  return prisma.tea.delete({
    where: { id },
  });
}

export async function addTea(tea: TeaCreateInput): Promise<Tea> {
  return prisma.tea.create({
    data: {
      name: tea.name,
      description: tea.description ?? Prisma.skip,
      tags: tea.tags,
    },
  });
}

export async function updateTea(id: string, tea: TeaUpdateInput): Promise<Tea> {
  return prisma.tea.update({
    where: {
      id,
    },
    data: {
      name: tea.name,
      description: tea.description,
      tags: tea.tags,
    },
  });
}
