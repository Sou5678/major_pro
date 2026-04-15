import { Activity, Gauge, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function StatsBar({
  analyzed,
  averageScore,
  remaining,
}: {
  analyzed: number;
  averageScore: number;
  remaining: number | "Unlimited";
}) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="mb-2 sm:mb-3 flex items-center gap-2 text-text-tertiary">
            <Activity className="h-4 w-4" />
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">Resumes analyzed</p>
          <p className="mt-1.5 sm:mt-2 font-display text-3xl sm:text-4xl font-bold text-text-primary">{analyzed}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="mb-2 sm:mb-3 flex items-center gap-2 text-text-tertiary">
            <Gauge className="h-4 w-4" />
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">Average score</p>
          <p className="mt-1.5 sm:mt-2 font-display text-3xl sm:text-4xl font-bold text-text-primary">{averageScore}</p>
        </CardContent>
      </Card>
      <Card className="sm:col-span-2 lg:col-span-1">
        <CardContent className="flex items-center justify-between p-4 sm:p-5">
          <div>
            <div className="mb-2 sm:mb-3 flex items-center gap-2 text-text-tertiary">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">Analyses remaining</p>
            <p className="mt-1.5 sm:mt-2 font-display text-3xl sm:text-4xl font-bold text-text-primary">{remaining}</p>
          </div>
          <Badge variant="accent">Live</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
