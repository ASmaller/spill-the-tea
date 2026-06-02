import "dotenv/config";
import { TeaCreateInput } from "@/generated/prisma/models";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

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

async function main() {
  for (const tea of TEAS) {
    await prisma.tea.create({
      data: tea,
    });
  }
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
