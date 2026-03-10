import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import {
  createLearningProgressSeedState,
  demoLearningProgressSeed,
} from "@/lib/demo-seed";
import { useLearningProgressStore } from "@/stores/learning-progress";

describe("HomePage", () => {
  beforeEach(() => {
    localStorage.clear();
    useLearningProgressStore.setState({
      ...createLearningProgressSeedState(),
    });
  });

  it("renders the simplified orientation hero and continue-learning surface", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "Learn machine learning as a calm, navigable concept graph.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("以可导航的概念图谱学习机器学习基础。")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Start with Train\/Val\/Test/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Resume Logistic Regression/i,
      }),
    ).toHaveAttribute("href", `/learn/${demoLearningProgressSeed.currentNodeId}`);
  });
});
