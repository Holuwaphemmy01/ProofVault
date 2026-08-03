import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.string().default("development"),
});

export const env = envSchema.parse({
  API_PORT: process.env.API_PORT,
  NODE_ENV: process.env.NODE_ENV,
});
