import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Get started</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-text-primary">Create your ResumeIQ account</h1>
        <p className="mt-2 text-text-secondary">Start with 3 free analyses and upgrade when you need more.</p>
      </div>
      <SignUpForm />
    </div>
  );
}
