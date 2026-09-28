import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [projectCount, activeCount, totalBudget] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.project.aggregate({ _sum: { budgetTotal: true } }),
  ]);

  const stats = [
    { label: "Projects", value: String(projectCount) },
    { label: "Active", value: String(activeCount) },
    { label: "Total budget", value: formatMoney(totalBudget._sum.budgetTotal?.toNumber() ?? 0) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Signed in as {user.name} ({user.role}).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-neutral-200 bg-white p-5"
          >
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
        <p className="text-sm font-medium">Nothing else to show yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
          Cost items, budgets, purchase orders, invoices and reporting are not
          part of this step.
        </p>
        <Link
          href="/projects"
          className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          Go to Projects
        </Link>
      </div>
    </div>
  );
}
