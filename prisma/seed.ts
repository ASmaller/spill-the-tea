import "dotenv/config";
import { ReviewCreateInput, TeaCreateInput } from "@/generated/prisma/models";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

await prisma.tea.deleteMany({})
await prisma.review.deleteMany({})

const TEAS: TeaCreateInput[] = [
  {
    name: "Earl Grey",
    description: "A simple earl grey",
    tags: ["citrus", "black"],
  },
  {
    name: "White Raspberry",
    description: "A white and fruity tea",
    tags: ["white", "fruity"],
  },
  {
    name: "Four red fruits",
    description: "A very fruity sweet tea",
    tags: ["black", "fruity"],
  },
];

const REVIEWS: ReviewCreateInput[] = [
  {
    rating: 3,
    comment: "Helt ok",
    posted: new Date("2025-01-05"),
    tea: {
      connect: { name: "Earl Grey" },
    },
  },
  {
    rating: 5,
    comment: "Love the citrus aroma and smooth flavor.",
    posted: new Date("2025-01-12"),
    tea: {
      connect: { name: "Earl Grey" },
    },
  },
  {
    rating: 4,
    comment: "Great breakfast tea, pairs well with milk.",
    posted: new Date("2025-01-18"),
    tea: {
      connect: { name: "Earl Grey" },
    },
  },
  {
    rating: 5,
    comment: "Very refreshing and naturally sweet.",
    posted: new Date("2025-02-02"),
    tea: {
      connect: { name: "White Raspberry" },
    },
  },
  {
    rating: 4,
    comment: "Light and fruity, perfect for summer.",
    posted: new Date("2025-02-10"),
    tea: {
      connect: { name: "White Raspberry" },
    },
  },
  {
    rating: 2,
    comment: "Too subtle for my taste.",
    posted: new Date("2025-02-15"),
    tea: {
      connect: { name: "White Raspberry" },
    },
  },
  {
    rating: 5,
    comment: "Rich berry flavor and wonderfully sweet.",
    posted: new Date("2025-03-01"),
    tea: {
      connect: { name: "Four red fruits" },
    },
  },
  {
    rating: 4,
    comment: "Smells amazing and tastes even better.",
    posted: new Date("2025-03-08"),
    tea: {
      connect: { name: "Four red fruits" },
    },
  },
  {
    rating: 3,
    comment: "Good everyday tea, though a bit sweet.",
    posted: new Date("2025-03-15"),
    tea: {
      connect: { name: "Four red fruits" },
    },
  },
  {
    rating: 1,
    comment: "Not my cup of tea, too fruity.",
    posted: new Date("2025-03-22"),
    tea: {
      connect: { name: "Four red fruits" },
    },
  },
  {
    rating: 5,
    comment: "One of my favorites, would definitely buy again.",
    posted: new Date("2025-04-01"),
    tea: {
      connect: { name: "Earl Grey" },
    },
  },
  {
    rating: 4,
    comment: "Pleasant and easy to drink.",
    posted: new Date("2025-04-09"),
    tea: {
      connect: { name: "White Raspberry" },
    },
  },
];

async function main() {
  for (const tea of TEAS) {
    await prisma.tea.create({
      data: tea
    })
  }
  for (const review of REVIEWS) {
    await prisma.review.create({
      data: review
    })
  }
  console.log("added teas and reviews");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
