"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/shared/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpSchema } from "@/lib/validations";

export function SignUpForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password");
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const result = (await response.json()) as {
          success: boolean;
          data?: { user: { id: string; email: string; name?: string | null; image?: string | null; plan: "FREE" | "PRO" | "ENTERPRISE"; analysisCount: number } };
          error?: { message: string };
        };

        if (!response.ok || !result.success) {
          toast.error(result.error?.message ?? "Unable to create your account.");
          return;
        }

        // Hydrate AuthProvider directly from response — no extra /api/auth/session call
        if (result.data?.user) {
          setUser(result.data.user);
        }
        toast.success("Welcome to ResumeIQ.");
        router.push("/dashboard");
      } catch {
        toast.error("Unable to create your account right now.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
      {[
        ["Full name", "name", "Alex Johnson"],
        ["Email", "email", "you@example.com"],
      ].map(([label, field, placeholder], index) => (
        <motion.div
          key={field}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="space-y-1.5 sm:space-y-2"
        >
          <label className="text-xs sm:text-sm text-text-secondary">{label}</label>
          <Input
            type={field === "email" ? "email" : "text"}
            placeholder={placeholder}
            {...form.register(field as "name" | "email")}
          />
          <p className="text-xs sm:text-sm text-danger">
            {field === "name" ? form.formState.errors.name?.message : form.formState.errors.email?.message}
          </p>
        </motion.div>
      ))}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm text-text-secondary">Password</label>
        <Input type="password" placeholder="Create a strong password" {...form.register("password")} />
        <div className="space-y-1.5 sm:space-y-2">
          <div className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-danger via-warning to-success transition-all duration-300"
              style={{ width: `${(strength / 4) * 100}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary">Use 8+ characters, 1 uppercase, 1 number, and 1 special character.</p>
        </div>
        <p className="text-xs sm:text-sm text-danger">{form.formState.errors.password?.message}</p>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm text-text-secondary">Confirm password</label>
        <Input type="password" placeholder="Repeat your password" {...form.register("confirmPassword")} />
        <p className="text-xs sm:text-sm text-danger">{form.formState.errors.confirmPassword?.message}</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        aria-label="Continue with Google"
        onClick={() => {
          window.location.href = "/api/auth/google/start?next=/dashboard";
        }}
      >
        Continue with Google
      </Button>
      <div className="flex items-center gap-2 sm:gap-3 text-xs uppercase tracking-[0.24em] text-text-tertiary">
        <span className="h-px flex-1 bg-white/10" />
        Or create with email
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-xs sm:text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/signin" className="text-text-primary underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
