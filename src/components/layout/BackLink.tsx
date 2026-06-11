"use client";

import { FOCUS_RING } from "@/lib/styles";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function BackLink({ children }: Props) {
  const router = useRouter();
  return (
    <span
      onClick={() => router.back()}
      className={`text-ink-soft hover:text-ink text-back mb-1 block w-fit cursor-pointer rounded-sm transition-colors ${FOCUS_RING.cream}`}
    >
      ← {children}
    </span>
  );
}
