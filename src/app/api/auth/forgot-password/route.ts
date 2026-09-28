import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import {
  buildResetUrl,
  generateToken,
  logEmail,
  RESET_TOKEN_TTL_MS,
} from "@/lib/tokens";
import { getBaseUrl } from "@/lib/url";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { email } = parsed.data;
  const origin = getBaseUrl(request);
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      }),
    ]);

    logEmail("RESET", user.email, buildResetUrl(token, origin));
  } else {
    // No account with this email: still respond identically so the endpoint
    // cannot be used to enumerate registered addresses.
    console.log(`[RESET] No account for ${email}; no reset link generated.`);
  }

  return NextResponse.json({
    ok: true,
    message:
      "If an account exists for that address, a reset link has been generated. Check the application logs.",
  });
}
