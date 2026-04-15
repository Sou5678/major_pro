"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/shared/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInSchema } from "@/lib/validations";

export function SignInForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const callbackFromLocation =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("callbackUrl")
            : null;
        const callbackUrl = (callbackFromLocation ?? "/dashboard") as
          | "/dashboard"
          | "/analyze"
          | "/pricing"
          | "/signin"
          | "/signup";
        
        console.log("Signing in...");
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Ensure cookies are sent/received
          body: JSON.stringify({
            email: values.email,
            password: values.password,
            rememberMe: values.rememberMe,
          }),
        });
        
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
        
        const result = (await response.json()) as {
          success: boolean;
          data?: {
            user: {
              id: string;
              email: string;
              name?: string | null;
              image?: string | null;
              plan: "FREE" | "PRO" | "ENTERPRISE";
              analysisCount: number;
            };
          };
          error?: { message: string };
        };

        console.log("Result:", result);

        if (!response.ok || !result.success) {
          toast.error(result.error?.message ?? "Unable to sign in.");
          return;
        }

        if (result.data?.user) {
          console.log("Setting user:", result.data.user);
          // Update the auth context immediately
          setUser(result.data.user);
          
          toast.success("Welcome back.");
          
          // Wait for cookie to be set by browser before redirecting
          // This ensures the cookie is available on the next page load
          console.log("Navigating to:", callbackUrl);
          
          // Refresh router cache to clear any stale data
          router.refresh();
          
          // Small delay to ensure cookie is set and router is refreshed
          setTimeout(() => {
            window.location.href = callbackUrl;
          }, 200);
        } else {
          toast.error("Authentication failed. Please try again.");
        }
      } catch (error) {
        console.error("Sign in error:", error);
        toast.error("Unable to sign in right now.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm text-text-secondary">Email</label>
        <Input type="email" placeholder="you@example.com" {...form.register("email")} />
        <p className="text-xs sm:text-sm text-danger">{form.formState.errors.email?.message}</p>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <label className="text-text-secondary">Password</label>
          <Link
            href="/forgot-password"
            className="text-text-secondary transition hover:text-text-primary"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="pr-10 sm:pr-12"
            {...form.register("password")}
          />
          <button
            type="button"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-text-secondary p-1"
            onClick={() => setShowPassword((value) => !value)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs sm:text-sm text-danger">{form.formState.errors.password?.message}</p>
      </div>
      <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-secondary">
        <input type="checkbox" className="h-4 w-4 rounded border-border" {...form.register("rememberMe")} />
        Remember me
      </label>
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={() => {
          const callbackFromLocation =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("callbackUrl")
              : null;
          const nextPath = callbackFromLocation?.startsWith("/") ? callbackFromLocation : "/dashboard";
          window.location.href = `/api/auth/google/start?next=${encodeURIComponent(nextPath)}`;
        }}
      >
        Continue with Google
      </Button>
      <p className="text-center text-xs sm:text-sm text-text-secondary">
        New here?{" "}
        <Link href="/signup" className="text-text-primary underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}
