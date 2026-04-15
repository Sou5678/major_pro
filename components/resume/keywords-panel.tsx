import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumeAnalysis } from "@/types";

export function KeywordsPanel({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <Card id="keywords">
      <CardHeader>
        <CardTitle>Keyword Analysis</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Keywords Found</p>
          <div className="flex flex-wrap gap-2">
            {analysis.keywordAnalysis.foundKeywords.map((keyword) => (
              <Badge key={keyword} variant="success">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-300">Missing Keywords</p>
          <div className="flex flex-wrap gap-2">
            {analysis.keywordAnalysis.missingKeywords.map((keyword) => (
              <div key={keyword} className="flex items-center gap-2">
                <Badge variant="outline">{keyword}</Badge>
                <Button size="sm" variant="ghost">
                  Add to Resume
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
