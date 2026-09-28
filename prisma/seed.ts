import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * The first user to sign up through /signup automatically becomes ADMIN, so
 * there is deliberately no default account. Set SEED_ADMIN_EMAIL and
 * SEED_ADMIN_PASSWORD to create one non-interactively (e.g. for a quick
 * container smoke test).
 */
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Administrator";

  if (!email || !password) {
    console.log(
      "No SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD set. Skipping seed — the first user to visit /signup becomes ADMIN.",
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists; nothing to do.`);
    return;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "ADMIN",
    },
  });

  console.log(`Created ADMIN user ${email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
