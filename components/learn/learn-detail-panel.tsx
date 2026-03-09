"use client";

import { motion } from "framer-motion";
import { useMotionSettings } from "@/components/providers/motion-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ConceptRecommendation } from "@/lib/curriculum-navigation";
import { getPanelTransition } from "@/lib/motion";
import type { LearningStatus } from "@/lib/progress";
import type { CurriculumNode } from "@/lib/schema";
import { cn } from "@/lib/utils";

function renderMarkdownParagraphs(bodyMarkdown: string) {
  return bodyMarkdown.split("\n\n").map((paragraph) => (
    <p key={paragraph}>{paragraph}</p>
  ));
}

const learningActions: Array<{
  description: string;
  id: LearningStatus;
  label: string;
}> = [
  {
    id: "exploring",
    label: "Mark exploring",
    description: "Keep this concept active in your study loop.",
  },
  {
    id: "understood",
    label: "Mark understood",
    description: "You can explain the core idea without much prompting.",
  },
  {
    id: "mastered",
    label: "Mark mastered",
    description: "You are ready to use this concept as reliable prior knowledge.",
  },
];

export function LearnDetailPanel({
  node,
  nodeStatus,
  onNavigate,
  onSetNodeStatus,
  recommendations,
  unmetWarning,
}: {
  node: CurriculumNode;
  nodeStatus?: LearningStatus;
  onNavigate: (nodeId: string) => void;
  onSetNodeStatus: (status: LearningStatus) => void;
  recommendations: ConceptRecommendation[];
  unmetWarning: string | null;
}) {
  const { motionMode } = useMotionSettings();

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
      initial={{ opacity: 0, x: motionMode === "reduced" ? 0 : 12 }}
      transition={getPanelTransition(motionMode)}
    >
      <Card className="surface-panel overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <motion.div
                className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                layoutId={`learn-node-chip-${node.id}`}
                transition={getPanelTransition(motionMode)}
              >
                {node.shortTitle}
              </motion.div>
              <CardTitle className="text-xl">{node.title}</CardTitle>
              <CardDescription className="leading-6">{node.summary}</CardDescription>
            </div>
            <Badge variant="secondary">{node.module}</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Difficulty {node.difficulty}/5</Badge>
            <Badge variant="outline">{node.estimatedMinutes} min</Badge>
            <Badge variant={nodeStatus ? "secondary" : "outline"}>
              {nodeStatus ?? "Not marked"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div aria-label="Learning state" className="grid gap-2">
            {learningActions.map((action) => (
              <button
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition-colors duration-fast",
                  nodeStatus === action.id
                    ? "border-primary/30 bg-primary/10 shadow-soft"
                    : "border-border bg-background/80 hover:bg-secondary/50",
                )}
                key={action.id}
                onClick={() => onSetNodeStatus(action.id)}
                type="button"
              >
                <p className="font-medium text-foreground">{action.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {unmetWarning ? (
        <Card className="surface-panel border-amber-300/70 bg-amber-50/80">
          <CardHeader>
            <CardTitle className="text-base">Prerequisite warning</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-amber-950/80">
            <p>{unmetWarning}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="text-base">Intuition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>{node.intuition}</p>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="text-base">Formal definition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>{node.formalDefinition}</p>
        </CardContent>
      </Card>

      {node.formulas.length > 0 ? (
        <Card className="surface-panel">
          <CardHeader>
            <CardTitle className="text-base">Formulas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            {node.formulas.map((formula) => (
              <p className="rounded-xl border border-border/70 bg-background/80 px-3 py-3 font-mono text-xs" key={formula}>
                {formula}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="text-base">Study notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          {renderMarkdownParagraphs(node.bodyMarkdown)}
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="text-base">Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="space-y-2">
            {node.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="text-base">Exercise prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="space-y-2">
            {node.exercisePrompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="text-base">Next recommended nodes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((recommendation) => (
            <div className="rounded-xl border border-border/70 bg-background/80 p-3" key={recommendation.node.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{recommendation.node.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {recommendation.node.summary}
                  </p>
                </div>
                <Button
                  onClick={() => onNavigate(recommendation.node.id)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Open
                </Button>
              </div>
              <div className="mt-3 rounded-xl bg-secondary/60 px-3 py-3 text-sm text-muted-foreground">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Why next?
                </p>
                <p className="mt-2 leading-6">{recommendation.whyRecommended}</p>
              </div>
              {recommendation.warning ? (
                <p className="mt-3 text-sm leading-6 text-amber-900/85">
                  {recommendation.warning}
                </p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
