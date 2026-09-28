"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Field, FormError, FormSuccess, SubmitButton } from "@/components/auth-ui";

const ROLES = [
  { value: "VIEWER", label: "Viewer" },
  { value: "SITE_ENGINEER", label: "Site engineer" },
  { value: "PROJECT_MANAGER", label: "Project manager" },
  { value: "ADMIN", label: "Administrator" },
] as const;

export default function InviteForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      setError(null);
      setSuccess(null);

      startTransition(async () => {
        const response = await fetch("/api/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: String(form.get("email") ?? ""),
            role: String(form.get("role") ?? "VIEWER"),
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(data.error ?? "Could not create the invitation.");
          return;
        }

        setSuccess(`Invitation created for ${data.invite.email}. The link is in the application log.`);
        event.currentTarget?.reset?.();
        router.refresh();
      });
    },
    [router],
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <Field label="Email" name="email" type="email" required placeholder="engineer@example.com" />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-neutral-700">Role</span>
        <select
          name="role"
          defaultValue="VIEWER"
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton pending={pending} className="w-auto">
        Create invitation
      </SubmitButton>
      <div className="sm:col-span-3 space-y-3">
        <FormError message={error} />
        <FormSuccess message={success} />
      </div>
    </form>
  );
}
