"use client";

import { useState, useTransition, useCallback } from "react";
import {
  AuthCard,
  Field,
  FormError,
  FormSuccess,
  SubmitButton,
  AuthFooter,
  AuthLink,
} from "@/components/auth-ui";

export default function ForgotPasswordForm() {
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
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: String(form.get("email") ?? "") }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(data.error ?? "Could not process that request.");
          return;
        }

        setSuccess(
          data.message ??
            "If an account exists for that address, a reset link has been generated.",
        );
        event.currentTarget?.reset?.();
      });
    },
    [],
  );

  return (
    <AuthCard>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
        />
        <FormError message={error} />
        <FormSuccess message={success} />
        <SubmitButton pending={pending}>Generate reset link</SubmitButton>
      </form>
      <AuthFooter>
        <p className="text-xs text-neutral-500">
          No email service is configured yet. The reset link is written to the
          application log: <code className="text-neutral-700">docker compose logs app</code>
        </p>
        <div>
          <AuthLink href="/login">Back to sign in</AuthLink>
        </div>
      </AuthFooter>
    </AuthCard>
  );
}
