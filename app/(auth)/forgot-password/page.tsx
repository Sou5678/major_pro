import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Reset access</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-text-primary">Forgot your password?</h1>
        <p className="mt-2 text-text-secondary">Enter your email and ResumeIQ will prepare a password reset link.</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
