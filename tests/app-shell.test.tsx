import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/layout/app-shell";

describe("AppShell", () => {
  it("renders the shell landmarks and slotted content", () => {
    render(
      <AppShell
        center={<div>Canvas Area</div>}
        currentSection="map"
        description="Overview placeholder"
        rightPanel={<div>Detail Panel</div>}
        title="Map page"
      />,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByText("Canvas Area")).toBeInTheDocument();
    expect(screen.getByText("Detail Panel")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Map" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
