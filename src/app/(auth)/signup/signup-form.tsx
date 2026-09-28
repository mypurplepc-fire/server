"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  AuthCard,
  Field,
  FormError,
  SubmitButton,
  AuthFooter,
  AuthLink,
} from "@/components/auth-ui";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const token = searchParams.get("token") ?? "";

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const password = String(form.get("password") ?? "");
      const confirm = String(form.get("confirmPassword") ?? "");

      setError(null);
      setNotice(null);

      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }

      startTransition(async () => {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(form.get("name") ?? ""),
            email: String(form.get("email") ?? ""),
            password,
            inviteToken: token || undefined,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(data.error ?? "Could not create your account.");
          return;
        }

        if (data.user?.isFirstUser) {
          setNotice("Administrator account created. Signing you in...");
        }

        const result = await signIn("credentials", {
          email: String(form.get("email") ?? ""),
          password,
          redirect: false,
        });

        if (result?.error) {
          router.push("/login");
          router.refresh();
          return;
        }

        router.push("/dashboard");
        router.refresh();
      });
    },
    [router, token],
  );

  return (
    <AuthCard>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name" name="name" required autoComplete="name" autoFocus />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
        />
        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
        />
        <FormError message={error} />
        {notice ? (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {notice}
          </p>
        ) : null}
        <SubmitButton pending={pending}>Create account</SubmitButton>
      </form>
      <AuthFooter>
        <div>
          Already registered? <AuthLink href="/login">Sign in</AuthLink>
        </div>
      </AuthFooter>
    </AuthCard>
  );
}
