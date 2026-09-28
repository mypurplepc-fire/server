export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Construction Cost Control
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign in to continue
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
