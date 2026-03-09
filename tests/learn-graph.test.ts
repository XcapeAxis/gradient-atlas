import { mlFundamentalsGraph } from "@/data/ml-fundamentals";
import {
  getDirectionalNeighborId,
  getLearnNeighborhood,
} from "@/lib/learn-graph";

describe("learn graph neighborhood", () => {
  it("builds a small deterministic neighborhood around the current node", () => {
    const neighborhood = getLearnNeighborhood(
      mlFundamentalsGraph,
      "linear-regression",
      "math-refresh",
    );

    expect(neighborhood.currentNode.id).toBe("linear-regression");
    expect(neighborhood.starterPath.id).toBe("math-refresh");
    expect(neighborhood.visibleNodes.length).toBeGreaterThanOrEqual(7);
    expect(neighborhood.visibleNodes.length).toBeLessThanOrEqual(15);

    expect(
      neighborhood.visibleNodes.find((node) => node.id === "features-and-targets"),
    ).toMatchObject({
      role: "prerequisite",
      position: { x: 72, y: 210 },
    });

    expect(
      neighborhood.visibleNodes.find((node) => node.id === "regularization"),
    ).toMatchObject({
      role: "dependent",
      position: { x: 568, y: 210 },
    });

    expect(neighborhood.visibleEdges.every((edge) => edge.id.length > 0)).toBe(true);
  });

  it("finds directional keyboard neighbors from the layout positions", () => {
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
    ).toBe("regularization");
  });
});
