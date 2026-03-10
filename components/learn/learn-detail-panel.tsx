"use client";

import { motion } from "framer-motion";
import { useMotionSettings } from "@/components/providers/motion-provider";
import { Button } from "@/components/ui/button";
import type { ConceptRecommendation } from "@/lib/curriculum-navigation";
import { getPanelTransition } from "@/lib/motion";
import type { LearningStatus } from "@/lib/progress";
import type { CurriculumNode } from "@/lib/schema";
import { cn } from "@/lib/utils";

function renderMarkdownParagraphs(bodyMarkdown: string) {
  return bodyMarkdown.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}

function RelationshipList({
  items,
  label,
  onNavigate,
}: {
  items: CurriculumNode[];
  label: string;
  onNavigate: (nodeId: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="quiet-label">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            className="rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/50"
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            {item.shortTitle}
          </button>
        ))}
      </div>
    </div>
  );
}

const learningActions: Array<{
  id: LearningStatus;
  label: string;
}> = [
  { id: "exploring", label: "Mark exploring" },
  { id: "understood", label: "Mark understood" },
  { id: "mastered", label: "Mark mastered" },
];

export function LearnDetailPanel({
  node,
  nodeStatus,
  onNavigate,
  onSetNodeStatus,
  recommendations,
  relationshipGroups,
  unmetWarning,
}: {
  node: CurriculumNode;
  nodeStatus?: LearningStatus;
  onNavigate: (nodeId: string) => void;
  onSetNodeStatus: (status: LearningStatus) => void;
  recommendations: ConceptRecommendation[];
  relationshipGroups: {
    dependents: CurriculumNode[];
    prerequisites: CurriculumNode[];
    related: CurriculumNode[];
  };
  unmetWarning: string | null;
}) {
  const { motionMode } = useMotionSettings();

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="surface-panel space-y-5 p-6"
      initial={{ opacity: 0, x: motionMode === "reduced" ? 0 : 12 }}
      transition={getPanelTransition(motionMode)}
    >
      <div className="space-y-3">
        <p className="quiet-label">Concept detail</p>
        <div className="space-y-2">
          <motion.div
            className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
            layoutId={`learn-node-chip-${node.id}`}
            transition={getPanelTransition(motionMode)}
          >
            {node.shortTitle}
          </motion.div>
          <h2 className="font-display text-3xl text-foreground">{node.title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{node.summary}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {node.module} · Difficulty {node.difficulty}/5 · {node.estimatedMinutes} min
        </p>
      </div>

      <div aria-label="Learning state" className="flex flex-wrap gap-2">
        {learningActions.map((action) => (
          <button
            className={cn(
              "rounded-full border px-3 py-2 text-sm transition-colors",
              nodeStatus === action.id
                ? "border-primary/30 bg-primary/10 text-foreground"
                : "border-border/70 bg-background/70 text-muted-foreground hover:text-foreground",
            )}
            key={action.id}
            onClick={() => onSetNodeStatus(action.id)}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>

      {unmetWarning ? (
        <div className="rounded-[1rem] border border-amber-300/70 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-950/80">
          {unmetWarning}
        </div>
      ) : null}

      <div className="soft-divider space-y-3 pt-5">
        <p className="quiet-label">Intuition</p>
        <p className="text-sm leading-6 text-foreground">{node.intuition}</p>
      </div>

      <div className="soft-divider space-y-3 pt-5">
        <p className="quiet-label">Formal definition</p>
        <p className="text-sm leading-6 text-foreground">{node.formalDefinition}</p>
      </div>

      <div className="soft-divider space-y-4 pt-5">
        <RelationshipList
          items={relationshipGroups.prerequisites}
          label="Prerequisites"
          onNavigate={onNavigate}
        />
        <RelationshipList
          items={relationshipGroups.dependents}
          label="Builds into"
          onNavigate={onNavigate}
        />
        <RelationshipList
          items={relationshipGroups.related}
          label="Related"
          onNavigate={onNavigate}
        />
      </div>

      {node.formulas.length > 0 ? (
        <div className="soft-divider space-y-3 pt-5">
          <p className="quiet-label">Formulas</p>
          <div className="space-y-2">
            {node.formulas.map((formula) => (
              <p
                className="rounded-[1rem] border border-border/70 bg-background/78 px-3 py-3 font-mono text-xs text-foreground"
                key={formula}
              >
                {formula}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="soft-divider space-y-3 pt-5">
        <p className="quiet-label">Notes</p>
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          {renderMarkdownParagraphs(node.bodyMarkdown)}
        </div>
      </div>

      <div className="soft-divider space-y-3 pt-5">
        <p className="quiet-label">Examples</p>
        <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
          {node.examples.map((example) => (
            <li key={example}>{example}</li>
          ))}
        </ul>
      </div>

      <div className="soft-divider space-y-3 pt-5">
        <p className="quiet-label">Exercises</p>
        <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
          {node.exercisePrompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
      </div>

      <div className="soft-divider space-y-3 pt-5">
        <p className="quiet-label">Next recommended nodes</p>
        <div className="space-y-3">
          {recommendations.map((recommendation) => (
            <div className="space-y-2 rounded-[1rem] bg-background/72 px-4 py-4" key={recommendation.node.id}>
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
              <div className="text-sm leading-6 text-muted-foreground">
                <p className="quiet-label">Why next</p>
                <p className="mt-1">{recommendation.whyRecommended}</p>
                {recommendation.warning ? (
                  <p className="mt-2 text-amber-900/85">{recommendation.warning}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
