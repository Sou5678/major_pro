import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Welcome back</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-text-primary">Sign in to ResumeIQ</h1>
        <p className="mt-2 text-text-secondary">Continue your analysis, editing, and download workflow.</p>
      </div>
      <SignInForm />
    </div>
  );
}
