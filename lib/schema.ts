import { z } from "zod";

export const ModuleSchema = z.enum([
  "Foundations",
  "Data Splits and Leakage",
  "Linear Models and Optimization",
  "Evaluation and Generalization",
  "Trees and Ensembles",
  "Unsupervised Learning",
  "Neural Networks (Preview)",
]);

export const RelationTypeSchema = z.enum([
  "prerequisite_of",
  "uses",
  "optimizes",
  "evaluates",
  "regularizes",
  "contrasts_with",
  "example_of",
  "extension_of",
]);

export const StarterPathIdSchema = z.enum([
  "absolute-beginner",
  "math-refresh",
  "interview-oriented",
]);

const StringListSchema = z.array(z.string().min(1));

export const CurriculumNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  module: ModuleSchema,
  summary: z.string().min(1),
  intuition: z.string().min(1),
  formalDefinition: z.string().min(1),
  bodyMarkdown: z.string().min(1),
  difficulty: z.number().int().min(1).max(5),
  estimatedMinutes: z.number().int().min(1),
  aliases: StringListSchema,
  keyQuestions: StringListSchema.min(2),
  formulas: StringListSchema,
  examples: StringListSchema.min(1),
  exercisePrompts: StringListSchema.min(1),
});

export const GraphEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  relationType: RelationTypeSchema,
  label: z.string().min(1),
  rationale: z.string().min(1),
});

export const StarterPathSchema = z.object({
  id: StarterPathIdSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  nodeIds: StringListSchema.min(1),
});

export const KnowledgeGraphSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    nodes: z.array(CurriculumNodeSchema).min(1),
    edges: z.array(GraphEdgeSchema),
    starterPaths: z.array(StarterPathSchema).min(1),
  })
  .superRefine((graph, ctx) => {
    const nodeIds = new Set<string>();
    const edgeIds = new Set<string>();

    for (const node of graph.nodes) {
      if (nodeIds.has(node.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate node id: ${node.id}`,
        });
      }
      nodeIds.add(node.id);
    }

    for (const edge of graph.edges) {
      if (edgeIds.has(edge.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate edge id: ${edge.id}`,
        });
      }
      edgeIds.add(edge.id);

      if (!nodeIds.has(edge.source)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unknown edge source: ${edge.source}`,
        });
      }

      if (!nodeIds.has(edge.target)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unknown edge target: ${edge.target}`,
        });
      }
    }

    const starterPathIds = new Set<string>();

    for (const path of graph.starterPaths) {
      if (starterPathIds.has(path.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate starter path id: ${path.id}`,
        });
      }
      starterPathIds.add(path.id);

      for (const nodeId of path.nodeIds) {
        if (!nodeIds.has(nodeId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Unknown starter path node id: ${nodeId}`,
          });
        }
      }
    }
  });

export type Module = z.infer<typeof ModuleSchema>;
export type RelationType = z.infer<typeof RelationTypeSchema>;
export type StarterPathId = z.infer<typeof StarterPathIdSchema>;
export type CurriculumNode = z.infer<typeof CurriculumNodeSchema>;
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;
export type StarterPath = z.infer<typeof StarterPathSchema>;
export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;
