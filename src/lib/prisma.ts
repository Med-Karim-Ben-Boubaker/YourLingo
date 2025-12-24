import { PrismaClient } from "../generated/prisma";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
    const adapter = new PrismaLibSql({
        url: process.env.DATABASE_URL!,
    });

    return new PrismaClient({
        adapter,
        log: ['query', 'error', 'warn'],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;