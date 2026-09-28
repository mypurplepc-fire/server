import { requireRole, ADMIN_ONLY } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import InviteForm from "./invite-form";

export const dynamic = "force-dynamic";

type InviteRow = {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
  invitedBy: { name: string };
  state: "Accepted" | "Expired" | "Pending";
};

async function getInvites(): Promise<InviteRow[]> {
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

  const now = Date.now();

  return invites.map((invite) => ({
    ...invite,
    state: invite.acceptedAt
      ? "Accepted"
      : invite.expiresAt.getTime() < now
        ? "Expired"
        : "Pending",
  }));
}

export default async function InvitesPage() {
  await requireRole(...ADMIN_ONLY);

  const invites = await getInvites();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Invitations</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Sign-up is invite-only after the first administrator account.
        </p>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold">Invite a user</h2>
        <InviteForm />
      </section>

      {invites.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
          No invitations yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Invited by</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td className="px-4 py-3 font-medium">{invite.email}</td>
                  <td className="px-4 py-3 text-neutral-600">{invite.role}</td>
                  <td className="px-4 py-3 text-neutral-600">{invite.invitedBy.name}</td>
                  <td className="px-4 py-3 text-neutral-600 tabular-nums">
                    {invite.expiresAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-neutral-300 px-2 py-0.5 text-xs">
                      {invite.state}
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
