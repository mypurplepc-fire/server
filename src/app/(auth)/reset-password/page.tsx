import ResetPasswordForm from "./reset-password-form";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const raw = params.token;
  const token = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");

  return <ResetPasswordForm token={token} />;
}
