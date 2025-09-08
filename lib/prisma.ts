import { PrismaClient } from "@prisma/client";

// 使 PrismaClient 在开发环境下重用单例，避免热加载导致连接过多
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
