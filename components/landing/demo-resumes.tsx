"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

const demoResumes = [
  {
    id: 1,
    name: "Software Engineer Resume",
    role: "Senior Full Stack Developer",
    atsScore: 92,
    overallScore: 88,
    strengths: [
      "Strong technical keywords",
      "Quantified achievements",
      "Clear formatting"
    ],
    improvements: [
      "Add more leadership examples",
      "Include certifications section"
    ],
    keywords: ["React", "Node.js", "AWS", "TypeScript", "MongoDB"],
    status: "excellent"
  },
  {
    id: 2,
    name: "Marketing Manager Resume",
    role: "Digital Marketing Manager",
    atsScore: 78,
    overallScore: 82,
    strengths: [
      "Results-driven metrics",
      "Industry-specific keywords",
      "Professional summary"
    ],
    improvements: [
      "Optimize for ATS scanning",
      "Add more action verbs",
      "Reduce text density"
    ],
    keywords: ["SEO", "Google Analytics", "Campaign Management", "ROI", "Social Media"],
    status: "good"
  },
  {
    id: 3,
    name: "Product Designer Resume",
    role: "UX/UI Product Designer",
    atsScore: 85,
    overallScore: 90,
    strengths: [
      "Portfolio integration",
      "Design tool proficiency",
      "User-centered approach"
    ],
    improvements: [
      "Add more collaboration examples",
      "Include design process details"
    ],
    keywords: ["Figma", "User Research", "Prototyping", "Design Systems", "A/B Testing"],
    status: "excellent"
  }
];

function getScoreColor(score: number) {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
}

function getScoreLabel(status: string) {
  if (status === "excellent") return { label: "Excellent", color: "bg-green-100 text-green-700" };
  if (status === "good") return { label: "Good", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Needs Work", color: "bg-red-100 text-red-700" };
}

export function DemoResumes() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24 dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
            Live Examples
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            See Real Resume Analysis in Action
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Explore how our AI analyzes different resume types and provides actionable insights
          </p>
        </div>

        {/* Demo Resume Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {demoResumes.map((resume) => {
            const scoreLabel = getScoreLabel(resume.status);
            return (
              <Card
                key={resume.id}
                className="group relative overflow-hidden border-2 p-6 transition-all hover:border-blue-500 hover:shadow-xl"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {resume.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {resume.role}
                      </p>
                    </div>
                    <Badge className={scoreLabel.color}>
                      {scoreLabel.label}
                    </Badge>
                  </div>
                </div>

                {/* Scores */}
                <div className="mb-6 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ATS Score
                      </span>
                      <span className={`text-lg font-bold ${getScoreColor(resume.atsScore)}`}>
                        {resume.atsScore}%
                      </span>
                    </div>
                    <Progress value={resume.atsScore} className="h-2" />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Overall Score
                      </span>
                      <span className={`text-lg font-bold ${getScoreColor(resume.overallScore)}`}>
                        {resume.overallScore}%
                      </span>
                    </div>
                    <Progress value={resume.overallScore} className="h-2" />
                  </div>
                </div>

                {/* Keywords */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <TrendingUp className="h-4 w-4" />
                    Key Skills Detected
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resume.keywords.map((keyword, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Strengths
                  </div>
                  <ul className="space-y-1">
                    {resume.strengths.slice(0, 2).map((strength, idx) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Suggestions
                  </div>
                  <ul className="space-y-1">
                    {resume.improvements.slice(0, 2).map((improvement, idx) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                        • {improvement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-950 dark:to-purple-950" />
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Want to see how your resume scores?{" "}
            <a
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Try it free →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
