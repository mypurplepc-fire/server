import { Suspense } from "react";
import SignupForm from "./signup-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-neutral-500">Loading...</p>}>
      <SignupForm />
    </Suspense>
  );
}
