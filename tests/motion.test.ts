import {
  getCameraDuration,
  getNextMotionPreference,
  getNodeHoverAnimation,
  getNodePressAnimation,
  getPanelTransition,
  resolveMotionMode,
  toFramerReducedMotion,
} from "@/lib/motion";

describe("motion preference logic", () => {
  it("cycles through the motion preference order deterministically", () => {
    expect(getNextMotionPreference("system")).toBe("reduced");
    expect(getNextMotionPreference("reduced")).toBe("full");
    expect(getNextMotionPreference("full")).toBe("system");
  });

  it("resolves reduced motion from explicit preference or system setting", () => {
    expect(resolveMotionMode("reduced", false)).toBe("reduced");
    expect(resolveMotionMode("system", true)).toBe("reduced");
    expect(resolveMotionMode("full", true)).toBe("full");
    expect(resolveMotionMode("system", false)).toBe("full");
  });

  it("maps the resolved mode to framer-motion settings", () => {
    expect(toFramerReducedMotion("reduced")).toBe("always");
    expect(toFramerReducedMotion("full")).toBe("never");
  });

  it("keeps reduced-motion fallbacks understandable without translate or camera motion", () => {
    expect(getNodeHoverAnimation("reduced")).not.toHaveProperty("y");
    expect(getNodePressAnimation("reduced")).not.toHaveProperty("scale");
    expect(getCameraDuration("reduced")).toBe(0);
    expect(getPanelTransition("reduced").duration).toBeLessThanOrEqual(0.18);
  });
});
