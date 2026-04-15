"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema } from "@/lib/validations";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const result = (await response.json()) as {
          success: boolean;
          error?: { message?: string };
        };

        if (!response.ok || !result.success) {
          toast.error(result.error?.message ?? "Unable to reset password.");
          return;
        }

        toast.success("Password updated. You can sign in now.");
        router.push("/signin");
        router.refresh();
      } catch {
        toast.error("Unable to reset password.");
      }
    });
  });

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-5">
        <input type="hidden" {...form.register("token")} />
        <div className="space-y-2">
          <label className="text-sm text-text-secondary">New password</label>
          <Input type="password" placeholder="Create a strong password" {...form.register("password")} />
          <p className="text-sm text-danger">{form.formState.errors.password?.message}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-text-secondary">Confirm password</label>
          <Input type="password" placeholder="Repeat your password" {...form.register("confirmPassword")} />
          <p className="text-sm text-danger">{form.formState.errors.confirmPassword?.message}</p>
        </div>
        <Button type="submit" className="w-full" disabled={isPending || !token}>
          {isPending ? "Resetting password..." : "Reset password"}
        </Button>
      </form>
      {!token ? <p className="text-sm text-danger">This reset link is missing a token.</p> : null}
      <p className="text-center text-sm text-text-secondary">
        Back to{" "}
        <Link href="/signin" className="text-text-primary underline underline-offset-4">
          sign in
        </Link>
      </p>
    </div>
  );
}
