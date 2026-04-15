import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token ?? "";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Reset password</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-text-primary">Choose a new password</h1>
        <p className="mt-2 text-text-secondary">Set a new password and get back into your ResumeIQ account.</p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
