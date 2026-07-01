"use client";

import { TagsTable } from "@/components/browsers/tags/TagsTable";
import { PageShell } from "@/components/layout/PageShell";
import { Tag } from "@/generated/prisma/client";
import { getTags } from "@/services/tagService";
import { useCallback, useEffect, useState } from "react";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);

  const refreshTags = useCallback(async () => {
    const res = await getTags();
    setTags(res ?? []);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshTags();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshTags]);

  return (
    <PageShell title="Tags" subtitle="Manage tea tags">
      <main>
        <TagsTable tags={tags} onTagsChange={refreshTags} />
      </main>
    </PageShell>
  );
}
