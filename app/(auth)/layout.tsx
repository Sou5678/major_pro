import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-white/5 bg-[linear-gradient(135deg,rgba(102,126,234,0.25),rgba(118,75,162,0.18),rgba(10,10,15,0.95))] p-10 lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%)]" />
        <div className="relative max-w-lg space-y-8">
          <Badge variant="accent">Resume analysis for ambitious job seekers</Badge>
          <h1 className="font-display text-6xl font-bold leading-tight text-white">
            Every weak bullet, missing keyword, and silent rejection signal. Surfaced.
          </h1>
          <p className="text-lg text-indigo-100/80">
            ResumeIQ helps candidates see what recruiters and ATS filters are seeing before they click apply.
          </p>
          <Card className="border-white/10 bg-black/20 p-6">
            <p className="text-lg text-text-primary">
              &ldquo;ResumeIQ turned my resume into something I was proud to send again.&rdquo;
            </p>
            <p className="mt-3 text-sm text-text-secondary">A. Taylor, Senior Product Designer</p>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-[32px] border border-white/5 bg-surface p-8 shadow-glow">
          {children}
        </div>
      </div>
    </div>
  );
}
