import "dotenv/config";
import {
  ReviewCreateInput,
  TagCreateInput,
  TeaCreateInput,
} from "@/generated/prisma/models";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

await prisma.review.deleteMany({});
await prisma.tea.deleteMany({});
await prisma.tag.deleteMany({});

const TAGS: TagCreateInput[] = [
  {
    name: "black",
    color: "#333333",
  },
  {
    name: "white",
    color: "#AAAAAA",
  },
  {
    name: "citrus",
    color: "#33AAAA",
  },
  {
    name: "fruity",
    color: "#AA3333",
  },
];

const TEAS: TeaCreateInput[] = [
  {
    name: "Earl Grey",
    description: "A simple earl grey",
    tags: {
      connect: [{ name: "citrus" }, { name: "black" }],
    },
  },
  {
    name: "Black Currant",
    description: "A tasteful fruity tea",
    tags: {
      connect: [{ name: "black" }, { name: "fruity" }],
    },
  },
  {
    name: "White Raspberry",
    description: "A white and fruity tea",
    tags: {
      connect: [{ name: "white" }, { name: "fruity" }],
    },
  },
  {
    name: "Four red fruits",
    description: "A very fruity sweet tea",
    tags: {
      connect: [{ name: "black" }, { name: "fruity" }],
    },
  },
];

const REVIEWS: ReviewCreateInput[] = [
  {
    rating: 3,
    comment: "Helt ok",
    posted: new Date("2025-01-05"),
    tags: [],
    tea: {
      connect: { name: "Earl Grey" },
    },
  },
  {
    rating: 5,
    comment: "Love the citrus aroma and smooth flavor.",
    posted: new Date("2025-01-12"),
    tags: ["delicious", "aromatic"],
    tea: {
      connect: { name: "Earl Grey" },
    },
  },
  {
    rating: 4,
    comment: "Great breakfast tea, pairs well with milk.",
    posted: new Date("2025-01-18"),
    tags: ["energizing"],
    tea: {
      connect: { name: "Earl Grey" },
    },
  },
  {
    rating: 5,
    comment: "Very refreshing and naturally sweet.",
    posted: new Date("2025-02-02"),
    tags: ["fresh"],
    tea: {
      connect: { name: "White Raspberry" },
    },
  },
  {
    rating: 4,
    comment: "Light and fruity, perfect for summer.",
    posted: new Date("2025-02-10"),
    tags: ["delicious", "fresh"],
    tea: {
      connect: { name: "White Raspberry" },
    },
  },
  {
    rating: 2,
    comment: "Too subtle for my taste.",
    posted: new Date("2025-02-15"),
    tags: ["weak"],
    tea: {
      connect: { name: "White Raspberry" },
    },
  },
  {
    rating: 5,
    comment: "Rich berry flavor and wonderfully sweet.",
    posted: new Date("2025-03-01"),
    tags: ["aromatic", "fruity"],
    tea: {
      connect: { name: "Four red fruits" },
    },
  },
  {
    rating: 4,
    comment: "Smells amazing and tastes even better.",
    posted: new Date("2025-03-08"),
    tags: ["delicious", "aromatic"],
    tea: {
      connect: { name: "Four red fruits" },
    },
  },
  {
    rating: 3,
    comment: "Good everyday tea, though a bit sweet.",
    posted: new Date("2025-03-15"),
    tags: ["energizing"],
    tea: {
      connect: { name: "Four red fruits" },
    },
  },
  {
    rating: 1,
    comment: "Not my cup of tea, too fruity.",
    posted: new Date("2025-03-22"),
    tags: ["too sweet"],
    tea: {
      connect: { name: "Four red fruits" },
    },
  },
  {
    rating: 5,
    comment: "One of my favorites, will definitely have again.",
    posted: new Date("2025-04-01"),
    tags: ["delicious", "energizing"],
    tea: {
      connect: { name: "Earl Grey" },
    },
  },
  {
    rating: 4,
    comment: "Pleasant and easy to drink.",
    posted: new Date("2025-04-09"),
    tags: ["floral"],
    tea: {
      connect: { name: "White Raspberry" },
    },
  },
];

async function main() {
  for (const tag of TAGS) {
    await prisma.tag.create({
      data: tag,
    });
  }
  for (const tea of TEAS) {
    await prisma.tea.create({
      data: tea,
    });
  }
  for (const review of REVIEWS) {
    await prisma.review.create({
      data: review,
    });
  }
  console.log(
    `Added ${TAGS.length} tags, ${TEAS.length} teas and ${REVIEWS.length} reviews`
  );
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
