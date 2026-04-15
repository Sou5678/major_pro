import { Card, CardContent } from "@/components/ui/card";

export function SuggestionItem({
  original,
  improved,
  reason,
}: {
  original: string;
  improved: string;
  reason: string;
}) {
  return (
    <Card>
      <CardContent className="grid gap-4 p-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-rose-300">Original</p>
          <p className="text-sm text-text-secondary">{original}</p>
        </div>
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-emerald-300">Improved</p>
          <p className="text-sm text-text-primary">{improved}</p>
          <p className="mt-2 text-xs text-text-secondary">{reason}</p>
        </div>
      </CardContent>
    </Card>
  );
}
