import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LearnWorkspace } from "@/components/learn/learn-workspace";
import {
  initialLearningProgressState,
  useLearningProgressStore,
} from "@/stores/learning-progress";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("LearnWorkspace", () => {
  beforeEach(() => {
    pushMock.mockReset();
    localStorage.clear();
    useLearningProgressStore.setState({
      ...initialLearningProgressState,
    });
  });

  it("updates the URL and detail panel when a visible node is selected", async () => {
    const user = userEvent.setup();

    render(<LearnWorkspace initialNodeId="linear-regression" />);

    await user.click(
      screen.getByRole("button", {
        name: /Logistic Regression\. Context concept\./i,
      }),
    );

    expect(pushMock).toHaveBeenCalledWith("/learn/logistic-regression");
    expect(
      screen.getAllByText("Logistic Regression").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(
        "Logistic regression predicts class probability with a linear score passed through a sigmoid.",
      ).length,
    ).toBeGreaterThanOrEqual(1);
    expect(useLearningProgressStore.getState().currentNodeId).toBe(
      "logistic-regression",
    );
  });

  it("synchronizes the client workspace when the route param changes", () => {
    const view = render(<LearnWorkspace initialNodeId="linear-regression" />);

    view.rerender(<LearnWorkspace initialNodeId="decision-tree" />);

    expect(
      screen.getAllByText("Decision Tree").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(
        "A decision tree makes predictions by recursively splitting the feature space.",
      ).length,
    ).toBeGreaterThanOrEqual(1);
    expect(useLearningProgressStore.getState().currentNodeId).toBe("decision-tree");
  });
});
