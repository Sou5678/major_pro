"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { BarChart3, FileUp, Home, LogOut, UserCircle2, FilePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

import { useAuth } from "@/components/shared/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreateResumeDialog } from "@/components/resume/create-resume-dialog";
import { cn } from "@/lib/utils";
import { BUILD_VERSION } from "@/lib/version";

const navItems: Array<{ href: Route; label: string; icon: typeof Home }> = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/analyze", label: "Analyze", icon: FileUp },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
  { href: "/pricing", label: "Pricing", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const freeLimit = Number(process.env.NEXT_PUBLIC_FREE_PLAN_ANALYSIS_LIMIT ?? 3);
  const used = user?.analysisCount ?? 0;
  const usage = Math.min((used / freeLimit) * 100, 100);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    toast.success("Signed out.");
    window.location.href = "/";
  };

  const handleCreateResume = () => {
    console.log('[Sidebar] Opening create resume dialog - Build:', BUILD_VERSION);
    setCreateDialogOpen(true);
  };

  return (
    <aside className="flex h-full min-h-full flex-col rounded-2xl sm:rounded-[28px] border border-border bg-surface p-3 sm:p-4">
      {/* Logo - Compact */}
      <Link href="/dashboard" className="mb-4 sm:mb-6 font-display text-lg sm:text-xl font-bold text-text-primary truncate">
        {process.env.NEXT_PUBLIC_APP_NAME ?? "ResumeIQ"}
      </Link>

      {/* Navigation - Optimized spacing */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition",
              pathname === item.href
                ? "border border-accent/30 bg-accent/10 text-text-primary shadow-[0_8px_24px_rgba(99,102,241,0.12)]"
                : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Usage Card - Compact */}
      <div className="mt-4 sm:mt-5 rounded-xl border border-border bg-surface-elevated p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">Usage</span>
          <Badge variant={user?.plan === "FREE" ? "warning" : "accent"} className="text-xs px-2 py-0.5">
            {user?.plan ?? "FREE"}
          </Badge>
        </div>
        <Progress value={usage} className="h-1.5" />
        <p className="mt-2 text-xs text-text-secondary">
          {used} of {freeLimit} analyses
        </p>
        <Button asChild variant="secondary" size="sm" className="mt-3 w-full h-8 text-xs">
          <Link href="/pricing">Upgrade to Pro</Link>
        </Button>
      </div>

      {/* Action Buttons - Always visible with forced rendering */}
      <div className="mt-3 sm:mt-4 space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={handleCreateResume}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            height: '2.25rem',
            padding: '0 0.75rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderRadius: '0.5rem',
            backgroundColor: 'rgb(99, 102, 241)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 150ms',
            boxShadow: '0 12px 30px rgba(99, 102, 241, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgb(79, 82, 221)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgb(99, 102, 241)';
          }}
        >
          <FilePlus className="h-4 w-4" />
          <span>Create Resume</span>
        </button>
        <Button asChild size="sm" variant="secondary" className="w-full h-9">
          <Link href="/analyze">New Analysis</Link>
        </Button>
      </div>

      <CreateResumeDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* User Profile - Compact and fixed at bottom */}
      <div className="mt-auto pt-3 sm:pt-4 rounded-xl border border-border bg-black/20 p-2.5 sm:p-3">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-lg transition hover:bg-white/5 p-1.5"
        >
          <UserCircle2 className="h-8 w-8 text-text-secondary flex-shrink-0" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-xs font-medium text-text-primary leading-tight">
              {user?.name ?? "ResumeIQ User"}
            </p>
            <p className="truncate text-[10px] text-text-secondary leading-tight mt-0.5">
              {user?.email}
            </p>
          </div>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2 w-full justify-start h-8 text-xs px-2" 
          onClick={() => void handleSignOut()}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
