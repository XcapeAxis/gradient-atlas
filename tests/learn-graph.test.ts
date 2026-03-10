import { mlFundamentalsGraph } from "@/data/ml-fundamentals";
import {
  getDirectionalNeighborId,
  getLearnEdgeVisualStyle,
  getLearnNeighborhood,
} from "@/lib/learn-graph";

describe("learn graph neighborhood", () => {
  it("builds a lane-based neighborhood with limited visible roles", () => {
    const neighborhood = getLearnNeighborhood(
      mlFundamentalsGraph,
      "linear-regression",
      "math-refresh",
    );
    const currentNode = neighborhood.visibleNodes.find((node) => node.role === "current");
    const prerequisites = neighborhood.visibleNodes.filter(
      (node) => node.role === "prerequisite",
    );
    const dependents = neighborhood.visibleNodes.filter(
      (node) => node.role === "dependent",
    );
    const related = neighborhood.visibleNodes.filter((node) => node.role === "related");

    expect(neighborhood.currentNode.id).toBe("linear-regression");
    expect(neighborhood.starterPath.id).toBe("math-refresh");
    expect(currentNode?.position).toEqual({ x: 490, y: 225 });
    expect(prerequisites.length).toBeLessThanOrEqual(2);
    expect(dependents.length).toBeLessThanOrEqual(2);
    expect(related.length).toBeLessThanOrEqual(2);
    expect(prerequisites.every((node) => node.position.x < 490)).toBe(true);
    expect(dependents.every((node) => node.position.x > 490)).toBe(true);
    expect(related.every((node) => node.position.y > 225)).toBe(true);
    expect(neighborhood.worldSize.width).toBeGreaterThan(900);
    expect(neighborhood.visibleEdges.every((edge) => edge.id.length > 0)).toBe(true);
  });

  it("adds overflow indicators when a lane has more nodes than the visible cap", () => {
    const neighborhood = getLearnNeighborhood(
      mlFundamentalsGraph,
      "linear-regression",
      "math-refresh",
    );

    expect(
      neighborhood.overflowIndicators.some((indicator) => indicator.count > 0),
    ).toBe(true);
  });

  it("finds directional keyboard neighbors from the lane positions", () => {
    const neighborhood = getLearnNeighborhood(
      mlFundamentalsGraph,
      "linear-regression",
      "math-refresh",
    );

    expect(
      getDirectionalNeighborId(
        neighborhood.visibleNodes,
        "linear-regression",
        "left",
      ),
    ).toBe("features-and-targets");
    expect(
      getDirectionalNeighborId(
        neighborhood.visibleNodes,
        "linear-regression",
        "right",
      ),
    ).not.toBeNull();
  });
});

describe("learn edge visual grouping", () => {
  it("treats prerequisite edges as the primary learning-order relation", () => {
    const style = getLearnEdgeVisualStyle({ relationType: "prerequisite_of" });

    expect(style.group).toBe("primary");
    expect(style.hasArrow).toBe(true);
    expect(style.dashArray).toBeUndefined();
    expect(style.strokeWidth).toBeGreaterThan(2);
  });

  it("treats non-prerequisite relations as secondary and visually weaker", () => {
    const style = getLearnEdgeVisualStyle({ relationType: "uses" });

    expect(style.group).toBe("secondary");
    expect(style.hasArrow).toBe(false);
    expect(style.dashArray).toBe("8 10");
    expect(style.strokeWidth).toBeLessThan(2);
  });
});
