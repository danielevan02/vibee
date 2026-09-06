import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// This project keeps its secrets in .env.local (Next.js convention), which the
// Prisma CLI does not read on its own.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
