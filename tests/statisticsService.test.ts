import { TeaWithReviews } from "@/lib/types";
import {
  getAdminOverview,
  getTeaCatalog,
  getTeaDetail,
  getTeaTrend,
} from "@/services/statisticsService";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  tea: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  review: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("statisticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns safe empty admin overview data", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T10:30:00.000Z"));

    prismaMock.review.findMany.mockResolvedValue([]);
    prismaMock.tea.findMany.mockResolvedValue([]);

    const overview = await getAdminOverview();

    expect(overview.teas).toEqual([]);
    expect(overview.kpis.map(kpi => kpi.value)).toEqual(["0.0", "0", "0"]);
  });

  it("aggregates admin tea catalog stats from reviews", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T10:30:00.000Z"));

    prismaMock.tea.findMany.mockResolvedValue([
      {
        id: "2",
        name: "Tacos",
        description: "Foo",
        tags: ["meat"],
        image: "",
        reviews: [
          {
            teaId: "2",
            userId: null,
            id: "100",
            rating: 5,
            comment: "Great",
            tags: ["fresh"],
            posted: new Date("2026-05-13T08:00:00.000Z"),
          },
          {
            teaId: "2",
            userId: null,
            id: "101",
            rating: 4,
            comment: null,
            tags: [],
            posted: new Date("2026-05-13T09:00:00.000Z"),
          },
        ],
      },
    ] satisfies TeaWithReviews[]);

    await expect(getTeaCatalog()).resolves.toEqual([
      expect.objectContaining({
        id: "2",
        name: "Tacos",
        tags: ["meat"],
        rating: 4.5,
        votes: 2,
        distribution: [0, 0, 0, 1, 1],
      }),
    ]);
  });

  it("builds admin tea detail comments, tag frequencies and distribution", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T10:30:00.000Z"));

    prismaMock.tea.findUnique.mockResolvedValue({
      id: "2",
      name: "Tacos",
      description: "Foo",
      tags: ["meat"],
      reviews: [
        {
          teaId: "2",
          userId: null,
          id: "100",
          rating: 5,
          comment: "Great",
          tags: ["fresh", "more please"],
          posted: new Date("2026-05-13T08:00:00.000Z"),
        },
        {
          teaId: "2",
          userId: null,
          id: "101",
          rating: 2,
          comment: "Too cold",
          tags: ["cold", "fresh"],
          posted: new Date("2026-05-13T09:00:00.000Z"),
        },
      ],
      image: "",
    } satisfies TeaWithReviews);

    const detail = await getTeaDetail("2");

    expect(detail).toEqual(
      expect.objectContaining({
        id: "2",
        distribution: [0, 1, 0, 0, 1],
        description: "Foo",
        reviews: [
          expect.objectContaining({ id: "100", comment: "Great" }),
          expect.objectContaining({ id: "101", comment: "Too cold" }),
        ],
        tagBars: [
          expect.objectContaining({ label: "fresh", count: 2 }),
          expect.objectContaining({ label: "cold", count: 1 }),
          expect.objectContaining({ label: "more please", count: 1 }),
        ],
      })
    );
  });

  it("orders tea trend ratings chronologically", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T10:30:00.000Z"));

    prismaMock.tea.findUnique.mockResolvedValue({
      id: "2",
      name: "Tacos",
      description: "Foo",
      tags: ["meat"],
      reviews: [
        {
          teaId: "2",
          userId: null,
          id: "100",
          rating: 5,
          comment: "Great",
          tags: ["fresh", "more please"],
          posted: new Date("2026-05-11T08:00:00.000Z"),
        },
        {
          teaId: "2",
          userId: null,
          id: "101",
          rating: 1,
          comment: "",
          tags: ["fresh", "more please"],
          posted: new Date("2026-05-12T08:00:00.000Z"),
        },
        {
          teaId: "2",
          userId: null,
          id: "101",
          rating: 3,
          comment: "",
          tags: ["fresh", "more please"],
          posted: new Date("2026-05-13T08:00:00.000Z"),
        },
      ],
      image: "",
    } satisfies TeaWithReviews);

    const trend = await getTeaTrend("2", 30);

    expect(trend).toEqual({
      xLabels: ["11 May", "12 May", "13 May"],
      series: [
        {
          name: "avg",
          color: "var(--color-tea)",
          data: [5, 3, 3],
        },
      ],
    });
  });
});
