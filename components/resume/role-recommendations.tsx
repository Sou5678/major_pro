"use client";

import { useState } from "react";
import { Briefcase, TrendingUp, Loader2, Target, AlertCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { JobRoleRecommendation } from "@/types";

interface RoleRecommendationsProps {
  resumeId: string;
}

export function RoleRecommendations({ resumeId }: RoleRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<JobRoleRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setRecommendations([]);

    try {
      const response = await fetch("/api/resume/role-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error?.message ?? "Failed to generate recommendations");
        return;
      }

      setRecommendations(result.data.recommendations);
      toast.success("Job role recommendations generated!");
    } catch (error) {
      console.error("Role recommendations error:", error);
      toast.error("Failed to generate recommendations");
    } finally {
      setIsGenerating(false);
    }
  };

  const getGrowthColor = (growth: string) => {
    switch (growth) {
      case "high":
        return "bg-emerald-500/10 text-emerald-300";
      case "medium":
        return "bg-amber-500/10 text-amber-300";
      case "low":
        return "bg-red-500/10 text-red-300";
      default:
        return "bg-gray-500/10 text-gray-300";
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-emerald-300";
    if (percentage >= 60) return "text-amber-300";
    return "text-red-300";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
            <Briefcase className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <CardTitle className="text-xl">Job Role Recommendations</CardTitle>
            <p className="text-sm text-text-secondary mt-1">
              AI-powered job role suggestions based on your resume
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <Briefcase className="h-16 w-16 mx-auto text-blue-300 mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Discover Your Career Path
            </h3>
            <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
              Get personalized job role recommendations with match percentages, required skills, and growth potential
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4" />
                  Get Role Recommendations
                </>
              )}
            </Button>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-indigo-300" />
                <h3 className="font-semibold text-text-primary">Analysis Summary</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Found {recommendations.length} matching roles based on your skills and experience.
                Top match: <span className="text-accent font-semibold">{recommendations[0]?.role}</span> at{" "}
                <span className="text-accent font-semibold">{recommendations[0]?.matchPercentage}%</span>
              </p>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-surface-elevated p-5 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-text-primary text-lg">{rec.role}</h4>
                        <Badge className={getGrowthColor(rec.growthPotential)}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {rec.growthPotential} growth
                        </Badge>
                      </div>
                      {rec.salaryRange && (
                        <div className="flex items-center gap-1 text-sm text-text-secondary mb-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{rec.salaryRange}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getMatchColor(rec.matchPercentage)}`}>
                        {rec.matchPercentage}%
                      </div>
                      <div className="text-xs text-text-secondary">Match</div>
                    </div>
                  </div>

                  {/* Match Progress */}
                  <div>
                    <Progress value={rec.matchPercentage} className="h-2" />
                  </div>

                  {/* Reasoning */}
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-sm text-text-secondary">{rec.reasoning}</p>
                  </div>

                  {/* Skills */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Required Skills */}
                    {rec.requiredSkills.length > 0 && (
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                        <p className="text-xs font-semibold text-emerald-200 mb-2">
                          ✅ Required Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.requiredSkills.map((skill, i) => (
                            <Badge
                              key={i}
                              className="bg-emerald-500/20 text-emerald-200 text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {rec.missingSkills.length > 0 && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                        <p className="text-xs font-semibold text-amber-200 mb-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Skills to Develop
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.missingSkills.map((skill, i) => (
                            <Badge
                              key={i}
                              className="bg-amber-500/20 text-amber-200 text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Regenerate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              variant="secondary"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4" />
                  Generate New Recommendations
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
