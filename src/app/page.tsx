"use client";

import { TeaBrowser } from "@/components/browsers/tea/TeaBrowser";
import { Tag } from "@/generated/prisma/client";
import { TeaStat } from "@/lib/types";
import { getMyRatings } from "@/services/reviewService";
import { getTeaCatalog } from "@/services/statisticsService";
import { getTags } from "@/services/tagService";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [teas, setTeas] = useState<TeaStat[] | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [myRatings, setMyRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    let ignore = false;

    getMyRatings()
      .then(rows => {
        if (!ignore) {
          setMyRatings(rows);
        }
      })
      .catch(error => {
        console.error("Failed to fetch my reviews: ", error);
      });

    getTeaCatalog()
      .then(teas => {
        if (!ignore) {
          setTeas(teas);
        }
      })
      .catch(error => {
        console.error("Failed to fetch teas: ", error);
      });

    getTags()
      .then(tags => {
        if (!ignore) {
          setTags(tags ? tags : []);
        }
      })
      .catch(error => {
        console.error("Failed to fetch tags: ", error);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const ratedIds = useMemo(() => new Set(Object.keys(myRatings)), [myRatings]);
  return (
    <main
      className="bg-cream flex-1 overflow-auto"
      style={{ padding: "24px 28px" }}
    >
      {teas != null ? (
        <TeaBrowser
          teas={teas}
          tags={tags}
          ratedIds={ratedIds}
          urlPrefix="/tea/"
        />
      ) : (
        <span>Loading teas...</span>
      )}
    </main>
  );
}
