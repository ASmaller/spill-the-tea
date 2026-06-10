"use client";

import { FeedHeader } from "@/components/feed/FeedHeader";
import { TeaBrowser } from "@/components/TeaBrowser/TeaBrowser";
import { TeaStat } from "@/lib/types";
import { getMyRatings } from "@/services/reviewService";
import { getTeaCatalog } from "@/services/statisticsService";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [teas, setTeas] = useState<TeaStat[] | null>(null);
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

    return () => {
      ignore = true;
    };
  }, []);

  const ratedIds = useMemo(() => new Set(Object.keys(myRatings)), [myRatings]);
  return (
    <div className="relative">
      <FeedHeader />
      <main
        className="bg-cream flex-1 overflow-auto"
        style={{ padding: "24px 28px" }}
      >
        {teas != null ? (
          <TeaBrowser teas={teas} ratedIds={ratedIds} urlPrefix="/tea/" />
        ) : (
          <span>Loading teas...</span>
        )}
      </main>
    </div>
  );
}
