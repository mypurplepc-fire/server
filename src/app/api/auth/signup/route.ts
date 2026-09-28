import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signupSchema } from "@/lib/validation";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 3;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, password, inviteToken } = parsed.data;
  const passwordHash = await hashPassword(password);

  // The "first user becomes ADMIN" check and the insert must be atomic,
  // otherwise two concurrent signups can both observe an empty user table.
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const user = await prisma.$transaction(
        async (tx) => {
          const userCount = await tx.user.count();
          const isFirstUser = userCount === 0;

          let role: "ADMIN" | "PROJECT_MANAGER" | "SITE_ENGINEER" | "VIEWER" =
            "VIEWER";
          let inviteId: string | null = null;

          if (isFirstUser) {
            role = "ADMIN";
          } else {
            if (!inviteToken) {
              throw new SignupError(
                "Sign-up is invite-only. Ask an administrator for an invitation.",
                403,
              );
            }

            const invite = await tx.invite.findUnique({
              where: { token: inviteToken },
            });

            if (
              !invite ||
              invite.acceptedAt ||
              invite.expiresAt < new Date() ||
              invite.email.toLowerCase() !== email
            ) {
              throw new SignupError(
                "This invitation is invalid, expired, or was issued for a different email address.",
                400,
              );
            }

            role = invite.role;
            inviteId = invite.id;
          }

          const created = await tx.user.create({
            data: { name, email, passwordHash, role },
            select: { id: true, email: true, role: true },
          });

          if (inviteId) {
            await tx.invite.update({
              where: { id: inviteId },
              data: { acceptedAt: new Date(), usedById: created.id },
            });
          }

          return created;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      return NextResponse.json(
        { user: { ...user, isFirstUser: user.role === "ADMIN" } },
        { status: 201 },
      );
    } catch (error) {
      if (error instanceof SignupError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 409 },
          );
        }
        // Serialization conflict: another signup ran concurrently. Retry.
        if (error.code === "P2034" && attempt < MAX_ATTEMPTS) continue;
      }
      console.error("signup failed", error);
      return NextResponse.json({ error: "Signup failed" }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Signup is busy, please try again" },
    { status: 503 },
  );
}

class SignupError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "SignupError";
    this.status = status;
  }
}
