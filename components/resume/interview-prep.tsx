"use client";

import { useState } from "react";
import { Brain, Lightbulb, Target, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InterviewPrep } from "@/types";

interface InterviewPrepProps {
  resumeId: string;
}

export function InterviewPrepDashboard({ resumeId }: InterviewPrepProps) {
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrep | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    setIsGenerating(true);
    setInterviewPrep(null);

    try {
      const response = await fetch("/api/resume/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error?.message ?? "Failed to generate interview prep");
        return;
      }

      setInterviewPrep(result.data);
      toast.success("Interview questions generated!");
    } catch (error) {
      console.error("Interview prep error:", error);
      toast.error("Failed to generate interview prep");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "technical":
        return "bg-blue-500/10 text-blue-300 border-blue-500/20";
      case "behavioral":
        return "bg-green-500/10 text-green-300 border-green-500/20";
      case "situational":
        return "bg-purple-500/10 text-purple-300 border-purple-500/20";
      case "experience":
        return "bg-orange-500/10 text-orange-300 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-300 border-gray-500/20";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-300";
      case "medium":
        return "bg-amber-500/10 text-amber-300";
      case "hard":
        return "bg-red-500/10 text-red-300";
      default:
        return "bg-gray-500/10 text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2.5">
            <Brain className="h-5 w-5 text-purple-300" />
          </div>
          <div>
            <CardTitle className="text-xl">Interview Prep Dashboard</CardTitle>
            <p className="text-sm text-text-secondary mt-1">
              AI-generated interview questions based on your resume
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!interviewPrep && (
          <div className="text-center py-8">
            <Brain className="h-16 w-16 mx-auto text-purple-300 mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Prepare for Your Interview
            </h3>
            <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
              Get 10 AI-generated interview questions tailored to your experience and the job description
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate Interview Questions
                </>
              )}
            </Button>
          </div>
        )}

        {interviewPrep && (
          <div className="space-y-6">
            {/* Focus Areas */}
            {interviewPrep.focusAreas && interviewPrep.focusAreas.length > 0 && (
              <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-indigo-300" />
                  <h3 className="font-semibold text-text-primary">Focus Areas</h3>
                </div>
                <div className="space-y-2">
                  {interviewPrep.focusAreas.map((area, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Tips */}
            {interviewPrep.overallTips && interviewPrep.overallTips.length > 0 && (
              <div className="rounded-2xl border border-warning/20 bg-warning/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-amber-300" />
                  <h3 className="font-semibold text-text-primary">Overall Tips</h3>
                </div>
                <div className="space-y-2">
                  {interviewPrep.overallTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-warning mt-0.5">💡</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-text-primary text-lg">Interview Questions</h3>
              {interviewPrep.questions.map((q, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-surface-elevated overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-text-primary">Q{index + 1}.</span>
                          <Badge className={getCategoryColor(q.category)}>
                            {q.category}
                          </Badge>
                          <Badge className={getDifficultyColor(q.difficulty)}>
                            {q.difficulty}
                          </Badge>
                        </div>
                        <p className="text-text-primary font-medium">{q.question}</p>
                      </div>
                      {expandedQuestions.has(index) ? (
                        <ChevronUp className="h-5 w-5 text-text-secondary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-text-secondary flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {expandedQuestions.has(index) && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                      {q.tips && (
                        <div className="rounded-xl bg-surface p-3">
                          <p className="text-xs font-semibold text-indigo-200 mb-1">💡 Tips</p>
                          <p className="text-sm text-text-secondary">{q.tips}</p>
                        </div>
                      )}
                      {q.sampleAnswer && (
                        <div className="rounded-xl bg-surface p-3">
                          <p className="text-xs font-semibold text-emerald-200 mb-1">
                            ✅ Sample Answer
                          </p>
                          <p className="text-sm text-text-secondary">{q.sampleAnswer}</p>
                        </div>
                      )}
                    </div>
                  )}
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
                  <Brain className="h-4 w-4" />
                  Generate New Questions
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
