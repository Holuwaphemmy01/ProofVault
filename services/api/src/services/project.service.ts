import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateProjectInput } from "../schemas/project.schema.js";

function sha256(value: string) {
  return `0x${crypto.createHash("sha256").update(value).digest("hex")}`;
}

function maskWallet(walletAddress: string) {
  if (!walletAddress || walletAddress.length < 10) {
    return walletAddress;
  }

  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

export async function createProject(input: CreateProjectInput) {
  try {
    return await prisma.project.create({
      data: {
        name: input.name,
        slug: input.slug,
        website: input.website,
        websiteHash: sha256(input.website),
        metadataHash: sha256(JSON.stringify({
          name: input.name,
          slug: input.slug,
          website: input.website,
          projectType: input.projectType,
          description: input.description,
        })),
        projectType: input.projectType,
        description: input.description,
        ownerWallet: input.ownerWallet,
        maskedOwnerWallet: maskWallet(input.ownerWallet),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Project slug already exists");
    }

    throw error;
  }
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
  });
}
