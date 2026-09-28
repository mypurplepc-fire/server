"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AuthCard,
  Field,
  FormError,
  SubmitButton,
  AuthFooter,
  AuthLink,
} from "@/components/auth-ui";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const password = String(form.get("password") ?? "");
      const confirm = String(form.get("confirmPassword") ?? "");

      setError(null);

      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }

      startTransition(async () => {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(data.error ?? "Could not reset your password.");
          return;
        }

        router.push("/login");
        router.refresh();
      });
    },
    [router, token],
  );

  if (!token) {
    return (
      <AuthCard>
        <p className="text-sm text-neutral-600">
          This reset link is missing its token. Request a new one from the{" "}
          <AuthLink href="/forgot-password">forgot password</AuthLink> page.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="New password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          autoFocus
        />
        <Field
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
        />
        <FormError message={error} />
        <SubmitButton pending={pending}>Set new password</SubmitButton>
      </form>
      <AuthFooter>
        <div>
          <AuthLink href="/login">Back to sign in</AuthLink>
        </div>
      </AuthFooter>
    </AuthCard>
  );
}
