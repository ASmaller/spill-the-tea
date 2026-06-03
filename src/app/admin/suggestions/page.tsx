"use client";

import { PageShell } from "@/components/admin/PageShell";
import { SuggestionsBrowser } from "@/components/admin/sections/SuggestionsBrowser";
import { Suggestion } from "@/generated/prisma/browser";
import {
  getAllSuggestions,
  updateLastVisited,
} from "@/services/suggestionService";
import { getCurrentUser, getUser } from "@/services/userService";
import { useEffect, useState } from "react";

export interface SuggestionAndUser extends Suggestion {
  displayName: string | null;
}

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<SuggestionAndUser[]>([]);
  const [lastViewed, setLastViewed] = useState<Date>(new Date());
  useEffect(() => {
    getCurrentUser().then(user => {
      if (user?.lastTimeReviewsViewed != null)
        setLastViewed(user.lastTimeReviewsViewed);
    });
    getAllSuggestions().then(async result => {
      const suggestionsList: SuggestionAndUser[] = await Promise.all(
        result.map(async suggestion => {
          const displayName = suggestion.userId
            ? ((await getUser(suggestion.userId))?.name ?? null)
            : null;
          return { ...suggestion, displayName };
        })
      );
      setSuggestions(suggestionsList);
      updateLastVisited();
    });
  }, []);
  return (
    <PageShell title="Suggestions" subtitle="Tea suggestions left by students">
      <SuggestionsBrowser suggestions={suggestions} lastViewed={lastViewed} />
    </PageShell>
  );
}
