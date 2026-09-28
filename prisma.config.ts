import "dotenv/config";
import { defineConfig } from "prisma/config";

// NOTE: `env("DATABASE_URL")` from prisma/config throws when the variable is
// absent, which breaks build-time commands such as `prisma generate` that do
// not need a database. Reading process.env directly lets the builder run
// without DATABASE_URL; the runtime still requires it (see src/lib/prisma.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
