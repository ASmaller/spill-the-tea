"use server";

import { Tea } from "@/generated/prisma/client";
import {
  TeaCreateInput,
  TeaUpdateInput,
  TeaWhereUniqueInput,
} from "@/generated/prisma/models";
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
  return prisma.tea.delete({
    where: { id },
  });
}

export async function addTea(tea: TeaCreateInput): Promise<Tea | null> {
  return prisma.tea.create({
    data: {
      id: tea.id,
      name: tea.name,
      description: tea.description,
      tags: tea.tags,
    },
  });
}

export async function updateTea(
  tea: TeaUpdateInput & { id: TeaWhereUniqueInput }
): Promise<Tea | null> {
  return prisma.tea.update({
    where: tea.id,
    data: {
      name: tea.name,
      description: tea.description,
      tags: tea.tags,
    },
  });
}
