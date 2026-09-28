import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function HomePage() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
