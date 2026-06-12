import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
