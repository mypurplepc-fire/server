"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Field, FormError, SubmitButton } from "@/components/auth-ui";

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "CLOSED", label: "Closed" },
] as const;

export default function ProjectForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      setError(null);

      startTransition(async () => {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(form.get("name") ?? ""),
            code: String(form.get("code") ?? ""),
            client: String(form.get("client") ?? ""),
            startDate: String(form.get("startDate") ?? ""),
            budgetTotal: String(form.get("budgetTotal") ?? ""),
            status: String(form.get("status") ?? "ACTIVE"),
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(data.error ?? "Could not create the project.");
          return;
        }

        event.currentTarget?.reset?.();
        router.refresh();
      });
    },
    [router],
  );

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Project name" name="name" required maxLength={200} placeholder="Riverside Apartments" />
      <Field label="Project code" name="code" required maxLength={40} placeholder="RIV-2026-01" />
      <Field label="Client" name="client" required maxLength={200} placeholder="Riverside Holdings" />
      <Field label="Start date" name="startDate" type="date" required />
      <Field
        label="Budget total"
        name="budgetTotal"
        required
        inputMode="decimal"
        placeholder="1250000.00"
      />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-neutral-700">Status</span>
        <select
          name="status"
          defaultValue="ACTIVE"
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <div className="sm:col-span-2 space-y-3">
        <FormError message={error} />
        <SubmitButton pending={pending} className="w-auto">
          Create project
        </SubmitButton>
      </div>
    </form>
  );
}
