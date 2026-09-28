"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium transition hover:bg-neutral-100"
    >
      Sign out
    </button>
  );
}
