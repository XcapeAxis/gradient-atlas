import { render, screen } from "@testing-library/react";
import { MapWorkspace } from "@/components/map/map-workspace";
import { createLearningProgressSeedState } from "@/lib/demo-seed";
import { useLearningProgressStore } from "@/stores/learning-progress";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("MapWorkspace", () => {
  beforeEach(() => {
    pushMock.mockReset();
    localStorage.clear();
    useLearningProgressStore.setState({
      ...createLearningProgressSeedState(),
    });
  });

  it("shows the simplified map framing, active starter path, and seeded preview node", () => {
    render(<MapWorkspace />);

    expect(
      screen.getByRole("heading", {
        name: "ML fundamentals map",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Absolute Beginner").length).toBeGreaterThan(0);
    expect(screen.getByText("Current path:")).toBeInTheDocument();
    expect(screen.getAllByText("Logistic Regression").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Recommended next")).toBeInTheDocument();
  });
});
