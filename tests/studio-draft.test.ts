import { mlFundamentalsGraph } from "@/data/ml-fundamentals";
import { useStudioDraftStore } from "@/stores/studio-draft";

describe("studio draft store", () => {
  beforeEach(() => {
    localStorage.clear();
    useStudioDraftStore.getState().resetToMlFundamentals();
    useStudioDraftStore.getState().selectGraph();
  });

  it("propagates node id edits to edges and starter paths", () => {
    useStudioDraftStore.getState().updateNode("linear-regression", {
      id: "linear-regression-renamed",
    });

    const draftGraph = useStudioDraftStore.getState().draftGraph;

    expect(
      draftGraph.nodes.some((node) => node.id === "linear-regression-renamed"),
    ).toBe(true);
    expect(
      draftGraph.edges.some(
        (edge) =>
          edge.source === "linear-regression-renamed" ||
          edge.target === "linear-regression-renamed",
      ),
    ).toBe(true);
    expect(
      draftGraph.starterPaths.some((path) =>
        path.nodeIds.includes("linear-regression-renamed"),
      ),
    ).toBe(true);
  });

  it("imports a full graph and resets back to the bundled pack", () => {
    const importedGraph = {
      ...mlFundamentalsGraph,
      id: "imported-pack",
      title: "Imported Pack",
    };

    useStudioDraftStore.getState().importGraph(importedGraph);
    expect(useStudioDraftStore.getState().draftGraph.title).toBe("Imported Pack");

    useStudioDraftStore.getState().resetToMlFundamentals();
    expect(useStudioDraftStore.getState().draftGraph.title).toBe(
      mlFundamentalsGraph.title,
    );
  });
});
