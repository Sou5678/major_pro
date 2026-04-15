import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ResumePreview({ text }: { text: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parsed Resume Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-2xl border border-border bg-black/20 p-5 text-sm text-text-secondary">
          {text}
        </pre>
      </CardContent>
    </Card>
  );
}
