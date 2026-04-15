import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="mx-auto min-h-screen max-w-[1600px] px-3 py-3 sm:px-4 sm:py-4">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]">
          <div className="hidden lg:block lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
            <Sidebar />
          </div>
          <div className="rounded-2xl sm:rounded-[28px] border border-white/5 bg-black/20 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
