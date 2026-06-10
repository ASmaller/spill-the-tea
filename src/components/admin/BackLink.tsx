"use client";

import { FOCUS_RING } from "@/lib/styles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export function BackLink({ href, children }: Props) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => router.back()}
      className={`text-ink-soft hover:text-ink text-back mb-1 block w-fit rounded-sm transition-colors ${FOCUS_RING.cream}`}
    >
      {children}
    </Link>
  );
}
