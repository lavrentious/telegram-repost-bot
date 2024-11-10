import * as dotenv from "dotenv";
import { z } from "zod";
import { logger } from "./logger";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  TOKEN: z.string(),
  ADMIN_ID: z.string().transform(Number),
  DB_PATH: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export class ConfigService {
  private readonly config: EnvConfig;

  constructor() {
    const path = ConfigService.isProduction()
      ? "production.env"
      : "development.env";
    logger.debug(`loading env vars from ${path}`);
    dotenv.config({
      path,
    });

    this.config = this.validateEnv();
  }

  private validateEnv(): EnvConfig {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      logger.error(
        "Invalid environment variables:",
        parsed.error.flatten().fieldErrors,
      );
      process.exit(1);
    }
    return parsed.data;
  }

  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  public static isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }
}

export const config = new ConfigService();
