export type MotionPreference = "system" | "reduced" | "full";
export type MotionMode = "reduced" | "full";

export const motionPreferenceOrder: MotionPreference[] = [
  "system",
  "reduced",
  "full",
];

export const motionTokens = {
  hover: 0.12,
  press: 0.09,
  selection: 0.24,
  pathHighlight: 0.16,
  panel: 0.18,
  camera: 0.24,
} as const;

const easeOut = [0.22, 1, 0.36, 1] as const;

export function getNextMotionPreference(currentPreference: MotionPreference) {
  const currentIndex = motionPreferenceOrder.indexOf(currentPreference);

  return motionPreferenceOrder[(currentIndex + 1) % motionPreferenceOrder.length];
}

export function resolveMotionMode(
  preference: MotionPreference,
  systemPrefersReducedMotion: boolean,
): MotionMode {
  if (preference === "reduced") {
    return "reduced";
  }

  if (preference === "system" && systemPrefersReducedMotion) {
    return "reduced";
  }

  return "full";
}

export function toFramerReducedMotion(mode: MotionMode) {
  return mode === "reduced" ? "always" : "never";
}

export function getNodeHoverAnimation(mode: MotionMode) {
  return mode === "reduced"
    ? {
        boxShadow: "0 16px 26px -24px rgba(34, 74, 86, 0.28)",
        transition: { duration: motionTokens.hover, ease: easeOut },
      }
    : {
        boxShadow: "0 18px 32px -26px rgba(34, 74, 86, 0.32)",
        transition: { duration: motionTokens.hover, ease: easeOut },
        y: -2,
      };
}

export function getNodePressAnimation(mode: MotionMode) {
  return mode === "reduced"
    ? {
        opacity: 0.94,
        transition: { duration: motionTokens.press, ease: easeOut },
      }
    : {
        scale: 0.99,
        transition: { duration: motionTokens.press, ease: easeOut },
        y: -0.5,
      };
}

export function getNodeSelectionTransition(mode: MotionMode) {
  return {
    duration: mode === "reduced" ? motionTokens.panel : motionTokens.selection,
    ease: easeOut,
  } as const;
}

export function getPathHighlightTransition(mode: MotionMode) {
  return {
    duration: mode === "reduced" ? motionTokens.hover : motionTokens.pathHighlight,
    ease: easeOut,
  } as const;
}

export function getPanelTransition(mode: MotionMode) {
  return {
    duration: mode === "reduced" ? 0.16 : motionTokens.panel,
    ease: easeOut,
  } as const;
}

export function getCameraDuration(mode: MotionMode) {
  return mode === "reduced" ? 0 : motionTokens.camera;
}
