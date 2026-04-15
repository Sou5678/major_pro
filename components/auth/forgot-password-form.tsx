"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema } from "@/lib/validations";

export function ForgotPasswordForm() {
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const result = (await response.json()) as {
          success: boolean;
          data?: { message?: string; resetUrl?: string };
          error?: { message?: string };
        };

        if (!response.ok || !result.success) {
          toast.error(result.error?.message ?? "Unable to start password reset.");
          return;
        }

        setResetUrl(result.data?.resetUrl ?? null);
        toast.success(result.data?.message ?? "Password reset started.");
      } catch {
        toast.error("Unable to start password reset.");
      }
    });
  });

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm text-text-secondary">Email</label>
          <Input type="email" placeholder="you@example.com" {...form.register("email")} />
          <p className="text-sm text-danger">{form.formState.errors.email?.message}</p>
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Preparing reset..." : "Send reset link"}
        </Button>
      </form>
      {resetUrl ? (
        <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <p className="text-sm font-medium text-text-primary">Reset link ready</p>
          <p className="mt-2 break-all text-sm text-text-secondary">{resetUrl}</p>
          <Button asChild className="mt-4 w-full">
            <a href={resetUrl}>Open reset page</a>
          </Button>
        </div>
      ) : null}
      <p className="text-center text-sm text-text-secondary">
        Back to{" "}
        <Link href="/signin" className="text-text-primary underline underline-offset-4">
          sign in
        </Link>
      </p>
    </div>
  );
}
