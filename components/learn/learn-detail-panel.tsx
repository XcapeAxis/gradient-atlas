"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
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

function Disclosure({
  children,
  defaultOpen = false,
  title,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="soft-divider pt-5">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium text-foreground"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen ? (
        <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function RelationshipRow({
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
            className="rounded-full border border-border/70 bg-background/84 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/36"
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
  { id: "exploring", label: "Exploring" },
  { id: "understood", label: "Understood" },
  { id: "mastered", label: "Mastered" },
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
  const primaryRecommendation = recommendations[0] ?? null;
  const secondaryRecommendations = recommendations.slice(1, 3);
  const keyArtifact =
    node.formulas[0] ?? node.examples[0] ?? "No formula or example yet.";
  const keyArtifactLabel = node.formulas.length > 0 ? "Key formula" : "Key example";

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="surface-panel space-y-5 p-6"
      initial={{ opacity: 0, x: motionMode === "reduced" ? 0 : 10 }}
      transition={getPanelTransition(motionMode)}
    >
      <div className="space-y-3">
        <p className="quiet-label">Concept detail</p>
        <div className="space-y-2">
          <h2 className="font-display text-3xl text-foreground">{node.title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{node.summary}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {node.module} | Difficulty {node.difficulty}/5 | {node.estimatedMinutes} min
        </p>
      </div>

      <div
        aria-label="Learning state"
        className="flex rounded-full border border-border/70 bg-background/72 p-1"
      >
        {learningActions.map((action) => (
          <button
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-sm transition-colors",
              nodeStatus === action.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
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
        <div className="rounded-[1rem] border border-amber-300/60 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-950/80">
          {unmetWarning}
        </div>
      ) : null}

      <div className="soft-divider space-y-3 pt-5">
        <p className="quiet-label">Why it matters</p>
        <p className="text-sm leading-6 text-foreground">{node.intuition}</p>
      </div>

      <div className="soft-divider space-y-4 pt-5">
        <RelationshipRow
          items={relationshipGroups.prerequisites}
          label="Prerequisites"
          onNavigate={onNavigate}
        />
        <RelationshipRow
          items={relationshipGroups.dependents}
          label="Next concepts"
          onNavigate={onNavigate}
        />
      </div>

      <div className="soft-divider space-y-3 pt-5">
        <p className="quiet-label">{keyArtifactLabel}</p>
        <div className="rounded-[1rem] border border-border/70 bg-background/78 px-4 py-4">
          <p
            className={cn(
              "text-sm leading-6 text-foreground",
              node.formulas.length > 0 && "font-mono text-xs",
            )}
          >
            {keyArtifact}
          </p>
        </div>
      </div>

      {primaryRecommendation ? (
        <div className="soft-divider space-y-3 pt-5">
          <p className="quiet-label">Why next</p>
          <div className="space-y-3 rounded-[1rem] border border-border/70 bg-background/78 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  {primaryRecommendation.node.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {primaryRecommendation.node.summary}
                </p>
              </div>
              <Button
                onClick={() => onNavigate(primaryRecommendation.node.id)}
                size="sm"
                type="button"
                variant="outline"
              >
                Open
              </Button>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {primaryRecommendation.whyRecommended}
            </p>
            {primaryRecommendation.warning ? (
              <p className="text-sm leading-6 text-amber-900/85">
                {primaryRecommendation.warning}
              </p>
            ) : null}
          </div>

          {secondaryRecommendations.length > 0 ? (
            <div className="space-y-2">
              <p className="quiet-label">Also consider</p>
              <div className="flex flex-wrap gap-2">
                {secondaryRecommendations.map((recommendation) => (
                  <button
                    className="rounded-full border border-border/70 bg-background/84 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/36"
                    key={recommendation.node.id}
                    onClick={() => onNavigate(recommendation.node.id)}
                    type="button"
                  >
                    {recommendation.node.shortTitle}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <Disclosure title="Formal definition">
        <p>{node.formalDefinition}</p>
      </Disclosure>

      <Disclosure title="Notes">
        {renderMarkdownParagraphs(node.bodyMarkdown)}
        {node.keyQuestions.length > 0 ? (
          <div className="space-y-2">
            <p className="quiet-label">Key questions</p>
            <ul className="space-y-1">
              {node.keyQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Disclosure>

      <Disclosure title="Examples and exercises">
        <div className="space-y-2">
          <p className="quiet-label">Examples</p>
          <ul className="space-y-1">
            {node.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="quiet-label">Exercise prompts</p>
          <ul className="space-y-1">
            {node.exercisePrompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </div>
      </Disclosure>

      <Disclosure title="More formulas and related concepts">
        {node.formulas.length > 1 ? (
          <div className="space-y-2">
            <p className="quiet-label">Additional formulas</p>
            <div className="space-y-2">
              {node.formulas.slice(1).map((formula) => (
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

        <RelationshipRow
          items={relationshipGroups.related}
          label="Related concepts"
          onNavigate={onNavigate}
        />
      </Disclosure>
    </motion.div>
  );
}
