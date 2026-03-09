import type { KnowledgeGraph, StarterPathId } from "@/lib/schema";
import { mlFundamentalsGraph } from "@/data/ml-fundamentals";

export interface PublishedGraphManifestEntry {
  description: string;
  graph: KnowledgeGraph;
  highlightedStarterPathId: StarterPathId;
  slug: string;
  summary: string;
  title: string;
}

export const publishedGraphs = [
  {
    slug: "ml-fundamentals",
    title: "ML Fundamentals",
    summary:
      "The first published Gradient Atlas pack covers core machine-learning concepts, validation, trees, clustering, and a neural-network preview.",
    description:
      "A curated single-user learning atlas for ML foundations, model selection, evaluation, ensembles, and unsupervised learning.",
    highlightedStarterPathId: "absolute-beginner",
    graph: mlFundamentalsGraph,
  },
] satisfies PublishedGraphManifestEntry[];

export function getPublishedGraph(slug: string) {
  return publishedGraphs.find((graphEntry) => graphEntry.slug === slug) ?? null;
}
