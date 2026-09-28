import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorizationError, requireApiRole, ADMIN_ONLY } from "@/lib/auth-helpers";
import { inviteSchema } from "@/lib/validation";
import {
  buildSignupUrl,
  generateToken,
  INVITE_TOKEN_TTL_MS,
  logEmail,
} from "@/lib/tokens";
import { getBaseUrl } from "@/lib/url";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireApiRole(...ADMIN_ONLY);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      createdAt: true,
      invitedBy: { select: { name: true } },
    },
  });

  return NextResponse.json({ invites });
}

export async function POST(request: Request) {
  let currentUserId: string;
  try {
    const user = await requireApiRole(...ADMIN_ONLY);
    currentUserId = user.id;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = inviteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { email, role } = parsed.data;
  const origin = getBaseUrl(request);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: "That email already belongs to a registered account" },
      { status: 409 },
    );
  }

  // Supersede any outstanding invite for the same address.
  await prisma.invite.deleteMany({ where: { email, acceptedAt: null } });

  const token = generateToken();
  const invite = await prisma.invite.create({
    data: {
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
      invitedById: currentUserId,
    },
    select: { id: true, email: true, role: true, expiresAt: true },
  });

  const url = buildSignupUrl(token, origin);
  logEmail("INVITE", email, url);

  return NextResponse.json({ invite: { ...invite, signupUrl: url } }, { status: 201 });
}
