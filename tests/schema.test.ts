import {
  mlFundamentalsEdges,
  mlFundamentalsGraph,
  mlFundamentalsNodes,
  mlFundamentalsStarterPaths,
} from "@/data/ml-fundamentals";

const allowedRelationTypes = new Set([
  "prerequisite_of",
  "uses",
  "optimizes",
  "evaluates",
  "regularizes",
  "contrasts_with",
  "example_of",
  "extension_of",
]);

describe("ml fundamentals curriculum pack", () => {
  it("ships the requested breadth", () => {
    expect(mlFundamentalsNodes).toHaveLength(41);
    expect(mlFundamentalsEdges.length).toBeGreaterThanOrEqual(75);
    expect(mlFundamentalsEdges.length).toBeLessThanOrEqual(90);
    expect(mlFundamentalsStarterPaths.map((path) => path.id)).toEqual([
      "absolute-beginner",
      "math-refresh",
      "interview-oriented",
    ]);
  });

  it("keeps node ids unique", () => {
    const nodeIds = mlFundamentalsNodes.map((node) => node.id);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
  });

  it("keeps edge ids unique and points every edge at known nodes", () => {
    const edgeIds = mlFundamentalsEdges.map((edge) => edge.id);
    const nodeIds = new Set(mlFundamentalsNodes.map((node) => node.id));

    expect(new Set(edgeIds).size).toBe(edgeIds.length);

    for (const edge of mlFundamentalsEdges) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });

  it("uses only allowed relation types", () => {
    for (const edge of mlFundamentalsEdges) {
      expect(allowedRelationTypes.has(edge.relationType)).toBe(true);
    }
  });

  it("keeps starter paths on valid node ids", () => {
    const nodeIds = new Set(mlFundamentalsNodes.map((node) => node.id));

    for (const path of mlFundamentalsStarterPaths) {
      expect(path.nodeIds.length).toBeGreaterThan(0);

      for (const nodeId of path.nodeIds) {
        expect(nodeIds.has(nodeId)).toBe(true);
      }
    }
  });

  it("keeps structured content on every node", () => {
    for (const node of mlFundamentalsGraph.nodes) {
      expect(node.shortTitle.length).toBeGreaterThan(0);
      expect(node.bodyMarkdown.length).toBeGreaterThan(0);
      expect(node.keyQuestions.length).toBeGreaterThanOrEqual(2);
      expect(node.examples.length).toBeGreaterThanOrEqual(1);
      expect(node.exercisePrompts.length).toBeGreaterThanOrEqual(1);
    }
  });
});
