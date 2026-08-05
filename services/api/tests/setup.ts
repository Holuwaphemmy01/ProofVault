import dotenv from "dotenv";
import { beforeEach } from "vitest";

process.env.NODE_ENV = "test";
dotenv.config();

if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

const databaseUrl = process.env.DATABASE_URL ?? "";
const isSafeDatabaseUrl =
  databaseUrl.includes("test") ||
  databaseUrl.includes("localhost") ||
  databaseUrl.includes("127.0.0.1");

if (!isSafeDatabaseUrl) {
  throw new Error(
    "Refusing to run API tests without a safe test database. Set DATABASE_URL_TEST to a URL containing test, localhost, or 127.0.0.1.",
  );
}

const { prisma } = await import("../src/lib/prisma.js");

beforeEach(async () => {
  await prisma.workerCallback.deleteMany();
  await prisma.proofResult.deleteMany();
  await prisma.assetBalance.deleteMany();
  await prisma.proofRequest.deleteMany();
  await prisma.project.deleteMany();
});
