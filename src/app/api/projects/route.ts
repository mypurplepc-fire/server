import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AuthorizationError,
  requireApiRole,
  PROJECT_WRITE_ROLES,
} from "@/lib/auth-helpers";
import { projectSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireApiRole();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    projects: projects.map((p) => ({ ...p, budgetTotal: p.budgetTotal.toString() })),
  });
}

export async function POST(request: Request) {
  try {
    await requireApiRole(...PROJECT_WRITE_ROLES);
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

  const parsed = projectSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, code, client, startDate, budgetTotal, status } = parsed.data;

  const existing = await prisma.project.findUnique({
    where: { code },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Project code "${code}" is already in use` },
      { status: 409 },
    );
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        code,
        client,
        startDate: new Date(`${startDate}T00:00:00.000Z`),
        budgetTotal,
        status,
      },
    });

    return NextResponse.json(
      { project: { ...project, budgetTotal: project.budgetTotal.toString() } },
      { status: 201 },
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: `Project code "${code}" is already in use` },
        { status: 409 },
      );
    }
    console.error("project create failed", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
