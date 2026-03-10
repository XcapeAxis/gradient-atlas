import {
  getViewportScrollTarget,
  isPointInsideSafeFrame,
} from "@/lib/learn-viewport";

describe("learn viewport contract", () => {
  const viewport = { height: 500, width: 800 };
  const world = { height: 900, width: 1400 };

  it("does not move the viewport on hover", () => {
    const target = getViewportScrollTarget(
      "hover",
      { x: 900, y: 420 },
      viewport,
      { left: 100, top: 80 },
      world,
    );

    expect(target).toBeNull();
  });

  it("does not recenter on select when the node stays inside the safe zone", () => {
    const point = { x: 520, y: 340 };
    const scroll = { left: 120, top: 90 };

    expect(isPointInsideSafeFrame(point, viewport, scroll)).toBe(true);
    expect(
      getViewportScrollTarget("select", point, viewport, scroll, world),
    ).toBeNull();
  });

  it("recenters only when the selected node leaves the safe zone", () => {
    const target = getViewportScrollTarget(
      "select",
      { x: 1180, y: 760 },
      viewport,
      { left: 120, top: 90 },
      world,
    );

    expect(target).toEqual({ left: 600, top: 400 });
  });
});
