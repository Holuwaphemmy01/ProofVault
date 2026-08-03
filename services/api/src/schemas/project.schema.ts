import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  website: z.string().url(),
  projectType: z.enum([
    "exchange",
    "dao",
    "bridge",
    "lending_protocol",
    "stablecoin_issuer",
    "asset_backed_token",
    "other",
  ]),
  description: z.string().optional().default(""),
  ownerWallet: z.string().min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
