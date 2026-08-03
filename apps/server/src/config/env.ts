import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

config({ path: fileURLToPath(new URL("../../../../.env", import.meta.url)) });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NASA_API_KEY: z
    .string()
    .trim()
    .min(1, "NASA_API_KEY is required. Use DEMO_KEY for local evaluation."),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  NASA_REQUEST_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(30_000)
    .default(30_000),
  NASA_CACHE_TTL_MS: z.coerce
    .number()
    .int()
    .min(0)
    .max(3_600_000)
    .default(300_000),
  NASA_CACHE_MAX_ENTRIES: z.coerce
    .number()
    .int()
    .min(1)
    .max(1_000)
    .default(100),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid server environment:\n${details}\nCopy .env.example to .env and update its values.`,
    );
  }
  return result.data;
}
