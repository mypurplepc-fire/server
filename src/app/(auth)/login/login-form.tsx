"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthCard, Field, FormError, SubmitButton, AuthFooter, AuthLink } from "@/components/auth-ui";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      setError(null);

      startTransition(async () => {
        const result = await signIn("credentials", {
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password.");
          return;
        }

        const from = searchParams.get("from");
        router.push(from && from.startsWith("/") ? from : "/dashboard");
        router.refresh();
      });
    },
    [router, searchParams],
  );

  return (
    <AuthCard>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <FormError message={error} />
        <SubmitButton pending={pending}>Sign in</SubmitButton>
      </form>
      <AuthFooter>
        <div>
          <AuthLink href="/forgot-password">Forgot your password?</AuthLink>
        </div>
        <div>
          Have an invitation?{" "}
          <AuthLink href="/signup">Create your account</AuthLink>
        </div>
      </AuthFooter>
    </AuthCard>
  );
}
