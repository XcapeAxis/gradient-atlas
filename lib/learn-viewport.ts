export interface ViewportPoint {
  x: number;
  y: number;
}

export interface ViewportSize {
  height: number;
  width: number;
}

export interface ViewportScroll {
  left: number;
  top: number;
}

export interface ViewportWorldSize {
  height: number;
  width: number;
}

export interface ViewportSafeFrame {
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;
}

export const DEFAULT_SAFE_FRAME: ViewportSafeFrame = {
  xMax: 0.8,
  xMin: 0.2,
  yMax: 0.8,
  yMin: 0.2,
};

export type LearnViewportIntent = "focus" | "hover" | "select" | "center";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getSafeFrameBounds(
  viewport: ViewportSize,
  safeFrame: ViewportSafeFrame = DEFAULT_SAFE_FRAME,
) {
  return {
    bottom: viewport.height * safeFrame.yMax,
    left: viewport.width * safeFrame.xMin,
    right: viewport.width * safeFrame.xMax,
    top: viewport.height * safeFrame.yMin,
  };
}

export function isPointInsideSafeFrame(
  point: ViewportPoint,
  viewport: ViewportSize,
  scroll: ViewportScroll,
  safeFrame: ViewportSafeFrame = DEFAULT_SAFE_FRAME,
) {
  const bounds = getSafeFrameBounds(viewport, safeFrame);
  const pointInViewport = {
    x: point.x - scroll.left,
    y: point.y - scroll.top,
  };

  return (
    pointInViewport.x >= bounds.left &&
    pointInViewport.x <= bounds.right &&
    pointInViewport.y >= bounds.top &&
    pointInViewport.y <= bounds.bottom
  );
}

export function getCenteredScrollPosition(
  point: ViewportPoint,
  viewport: ViewportSize,
  world: ViewportWorldSize,
) {
  return {
    left: clamp(point.x - viewport.width / 2, 0, Math.max(0, world.width - viewport.width)),
    top: clamp(
      point.y - viewport.height / 2,
      0,
      Math.max(0, world.height - viewport.height),
    ),
  };
}

export function getViewportScrollTarget(
  intent: LearnViewportIntent,
  point: ViewportPoint,
  viewport: ViewportSize,
  scroll: ViewportScroll,
  world: ViewportWorldSize,
  safeFrame: ViewportSafeFrame = DEFAULT_SAFE_FRAME,
) {
  if (intent === "hover" || intent === "focus") {
    return null;
  }

  if (intent === "select" && isPointInsideSafeFrame(point, viewport, scroll, safeFrame)) {
    return null;
  }

  return getCenteredScrollPosition(point, viewport, world);
}
