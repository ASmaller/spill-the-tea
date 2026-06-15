"use client";

import { SessionPayload } from "@/lib/types";
import { useEffect, useState } from "react";
import z from "zod";

export function useSession(): SessionPayload | null {
  const [session, setSession] = useState<SessionPayload | null>(null);
  useEffect(() => {
    fetch("/api/session")
      .then(response => {
        if (!response.ok) {
          throw new Error(`Session fetch failed: ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        const result = z.null().or(SessionPayload).safeParse(json);
        if (result.success) {
          setSession(result.data);
        } else {
          console.warn("Failed to parse session from API, see Zod error below");
          console.warn(result.error);
        }
      })
      .catch(error => {
        console.warn("Failed to fetch session:", error);
      });
  }, []);
  return session;
}
