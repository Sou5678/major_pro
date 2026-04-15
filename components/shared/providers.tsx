"use client";

import { Toaster } from "sonner";

import { AuthProvider } from "@/components/shared/auth-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            classNames: {
              toast:
                "border border-border bg-surface text-text-primary shadow-glow",
            },
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}
