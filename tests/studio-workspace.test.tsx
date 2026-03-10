import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudioWorkspace } from "@/components/studio/studio-workspace";
import { useStudioDraftStore } from "@/stores/studio-draft";

describe("StudioWorkspace", () => {
  beforeEach(() => {
    localStorage.clear();
    useStudioDraftStore.getState().resetToMlFundamentals();
    useStudioDraftStore.getState().selectGraph();
  });

  it("keeps raw JSON tools secondary behind the advanced tools disclosure", async () => {
    const user = userEvent.setup();

    render(<StudioWorkspace />);

    expect(screen.queryByLabelText("Import graph JSON")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Export preview")).not.toBeInTheDocument();

    await user.click(screen.getByText("Advanced tools"));

    expect(screen.getByLabelText("Import graph JSON")).toBeInTheDocument();
    expect(screen.getByLabelText("Export preview")).toBeInTheDocument();
  });
});
