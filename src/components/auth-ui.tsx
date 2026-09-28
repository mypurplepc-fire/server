import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
      />
    </label>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
    >
      {message}
    </p>
  );
}

export function SubmitButton({
  pending,
  children,
  className = "w-full",
}: {
  pending: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {pending ? "Please wait..." : children}
    </button>
  );
}

export function AuthFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 space-y-2 text-center text-sm text-neutral-600">
      {children}
    </div>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-neutral-900 underline underline-offset-4">
      {children}
    </Link>
  );
}
