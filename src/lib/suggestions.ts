import { Suggestion } from "@/generated/prisma/client";

/**
 * Check if a suggestion was posted after the admin page was viewed last.
 * @param suggestion The suggestion to check.
 * @returns If the suggestion is new.
 */
export function isNewSuggestion(
  suggestion: Suggestion,
  lastViewed: Date | null | undefined
): boolean {
  // TODO: Fetch actual last viewed time
  if (lastViewed instanceof Date && !Number.isNaN(lastViewed.getTime())) {
    return suggestion.postedDate > lastViewed;
  }
  return true;
}
