"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mlFundamentalsGraph } from "@/data/ml-fundamentals";
import type {
  CurriculumNode,
  GraphEdge,
  KnowledgeGraph,
  RelationType,
  StarterPath,
} from "@/lib/schema";

export type StudioSelection =
  | { kind: "graph" }
  | { edgeId: string; kind: "edge" }
  | { kind: "node"; nodeId: string };

function cloneGraph(graph: KnowledgeGraph): KnowledgeGraph {
  return JSON.parse(JSON.stringify(graph)) as KnowledgeGraph;
}

function createNodeTemplate(graph: KnowledgeGraph): CurriculumNode {
  return {
    aliases: [],
    bodyMarkdown: "Concise study notes.",
    difficulty: 1,
    estimatedMinutes: 6,
    examples: ["Add one concrete example."],
    exercisePrompts: ["Add one exercise prompt."],
    formalDefinition: "Add a textbook-level definition.",
    formulas: [],
    id: `new-concept-${graph.nodes.length + 1}`,
    intuition: "Add an intuition sentence.",
    keyQuestions: ["What is the core question?", "Why does it matter?"],
    module: "Foundations",
    shortTitle: "New Concept",
    summary: "Add a concise summary.",
    title: "New Concept",
  };
}

function createEdgeTemplate(graph: KnowledgeGraph): GraphEdge {
  const source = graph.nodes[0]?.id ?? "";
  const target = graph.nodes[1]?.id ?? source;

  return {
    id: `new-edge-${graph.edges.length + 1}`,
    label: "Prerequisite",
    rationale: "Explain why this relationship exists.",
    relationType: "prerequisite_of",
    source,
    target,
  };
}

interface StudioDraftState {
  createEdge: () => void;
  createNode: () => void;
  deleteSelectedEdge: () => void;
  deleteSelectedNode: () => void;
  draftGraph: KnowledgeGraph;
  importGraph: (graph: KnowledgeGraph) => void;
  resetToMlFundamentals: () => void;
  selected: StudioSelection;
  selectEdge: (edgeId: string) => void;
  selectGraph: () => void;
  selectNode: (nodeId: string) => void;
  updateEdge: (edgeId: string, patch: Partial<GraphEdge>) => void;
  updateGraph: (
    patch: Partial<Pick<KnowledgeGraph, "description" | "id" | "title">>,
  ) => void;
  updateNode: (nodeId: string, patch: Partial<CurriculumNode>) => void;
  updateStarterPath: (
    starterPathId: StarterPath["id"],
    patch: Partial<StarterPath>,
  ) => void;
}

export const useStudioDraftStore = create<StudioDraftState>()(
  persist(
    (set, get) => ({
      createEdge: () => {
        const edge = createEdgeTemplate(get().draftGraph);

        set((state) => ({
          draftGraph: {
            ...state.draftGraph,
            edges: [...state.draftGraph.edges, edge],
          },
          selected: { edgeId: edge.id, kind: "edge" },
        }));
      },
      createNode: () => {
        const node = createNodeTemplate(get().draftGraph);

        set((state) => ({
          draftGraph: {
            ...state.draftGraph,
            nodes: [...state.draftGraph.nodes, node],
          },
          selected: { kind: "node", nodeId: node.id },
        }));
      },
      deleteSelectedEdge: () => {
        const selected = get().selected;

        if (selected.kind !== "edge") {
          return;
        }

        set((state) => ({
          draftGraph: {
            ...state.draftGraph,
            edges: state.draftGraph.edges.filter((edge) => edge.id !== selected.edgeId),
          },
          selected: { kind: "graph" },
        }));
      },
      deleteSelectedNode: () => {
        const selected = get().selected;

        if (selected.kind !== "node") {
          return;
        }

        set((state) => ({
          draftGraph: {
            ...state.draftGraph,
            edges: state.draftGraph.edges.filter(
              (edge) =>
                edge.source !== selected.nodeId && edge.target !== selected.nodeId,
            ),
            nodes: state.draftGraph.nodes.filter((node) => node.id !== selected.nodeId),
            starterPaths: state.draftGraph.starterPaths.map((path) => ({
              ...path,
              nodeIds: path.nodeIds.filter((nodeId) => nodeId !== selected.nodeId),
            })),
          },
          selected: { kind: "graph" },
        }));
      },
      draftGraph: cloneGraph(mlFundamentalsGraph),
      importGraph: (graph) =>
        set({
          draftGraph: cloneGraph(graph),
          selected: { kind: "graph" },
        }),
      resetToMlFundamentals: () =>
        set({
          draftGraph: cloneGraph(mlFundamentalsGraph),
          selected: { kind: "graph" },
        }),
      selected: { kind: "graph" },
      selectEdge: (edgeId) => set({ selected: { edgeId, kind: "edge" } }),
      selectGraph: () => set({ selected: { kind: "graph" } }),
      selectNode: (nodeId) => set({ selected: { kind: "node", nodeId } }),
      updateEdge: (edgeId, patch) =>
        set((state) => {
          const nextEdgeId = patch.id ?? edgeId;

          return {
            draftGraph: {
              ...state.draftGraph,
              edges: state.draftGraph.edges.map((edge) =>
                edge.id === edgeId ? { ...edge, ...patch } : edge,
              ),
            },
            selected:
              state.selected.kind === "edge" && state.selected.edgeId === edgeId
                ? { edgeId: nextEdgeId, kind: "edge" as const }
                : state.selected,
          };
        }),
      updateGraph: (patch) =>
        set((state) => ({
          draftGraph: {
            ...state.draftGraph,
            ...patch,
          },
        })),
      updateNode: (nodeId, patch) =>
        set((state) => {
          const nextNodeId = patch.id ?? nodeId;

          return {
            draftGraph: {
              ...state.draftGraph,
              edges: state.draftGraph.edges.map((edge) => ({
                ...edge,
                source: edge.source === nodeId ? nextNodeId : edge.source,
                target: edge.target === nodeId ? nextNodeId : edge.target,
              })),
              nodes: state.draftGraph.nodes.map((node) =>
                node.id === nodeId ? { ...node, ...patch } : node,
              ),
              starterPaths: state.draftGraph.starterPaths.map((starterPath) => ({
                ...starterPath,
                nodeIds: starterPath.nodeIds.map((starterPathNodeId) =>
                  starterPathNodeId === nodeId ? nextNodeId : starterPathNodeId,
                ),
              })),
            },
            selected:
              state.selected.kind === "node" && state.selected.nodeId === nodeId
                ? { kind: "node" as const, nodeId: nextNodeId }
                : state.selected,
          };
        }),
      updateStarterPath: (starterPathId, patch) =>
        set((state) => ({
          draftGraph: {
            ...state.draftGraph,
            starterPaths: state.draftGraph.starterPaths.map((starterPath) =>
              starterPath.id === starterPathId
                ? { ...starterPath, ...patch }
                : starterPath,
            ),
          },
        })),
    }),
    {
      name: "gradient-atlas-studio-draft",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function getEdgeLabelForRelationType(relationType: RelationType) {
  switch (relationType) {
    case "prerequisite_of":
      return "Prerequisite";
    case "uses":
      return "Uses";
    case "optimizes":
      return "Optimizes";
    case "evaluates":
      return "Evaluates";
    case "regularizes":
      return "Regularizes";
    case "contrasts_with":
      return "Contrasts";
    case "example_of":
      return "Example";
    case "extension_of":
      return "Extension";
    default:
      return "Relation";
  }
}
