import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumeAnalysis } from "@/types";

export function SkillsMatrix({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <Card id="skills">
      <CardHeader>
        <CardTitle>Skills Gap Matrix</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Technical skills found</p>
          <div className="flex flex-wrap gap-2">
            {analysis.skillsAnalysis.technicalSkills.present.map((skill) => (
              <Badge key={skill} variant="success">
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-text-secondary">Missing</p>
          <div className="flex flex-wrap gap-2">
            {analysis.skillsAnalysis.technicalSkills.missing.map((skill) => (
              <Badge key={skill} variant="danger">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Soft skills</p>
          <div className="flex flex-wrap gap-2">
            {analysis.skillsAnalysis.softSkills.present.map((skill) => (
              <Badge key={skill} variant="success">
                {skill}
              </Badge>
            ))}
            {analysis.skillsAnalysis.softSkills.missing.map((skill) => (
              <Badge key={skill} variant="warning">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
