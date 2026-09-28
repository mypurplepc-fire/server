import { requireUser, PROJECT_WRITE_ROLES } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import ProjectForm from "./project-form";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  CLOSED: "Closed",
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function ProjectsPage() {
  const user = await requireUser();
  const canCreate = PROJECT_WRITE_ROLES.includes(user.role);

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {projects.length} project{projects.length === 1 ? "" : "s"} recorded.
        </p>
      </div>

      {canCreate ? (
        <section className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold">New project</h2>
          <ProjectForm />
        </section>
      ) : (
        <p className="rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Your role ({user.role}) can view projects but not create them.
        </p>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
          No projects yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 text-right font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-3 font-mono text-xs">{project.code}</td>
                  <td className="px-4 py-3 font-medium">{project.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{project.client}</td>
                  <td className="px-4 py-3 text-neutral-600 tabular-nums">
                    {project.startDate.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatMoney(project.budgetTotal.toNumber())}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-neutral-300 px-2 py-0.5 text-xs">
                      {STATUS_LABEL[project.status] ?? project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
