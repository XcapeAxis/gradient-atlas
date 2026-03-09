export type MotionPreference = "system" | "reduced" | "full";
export type MotionMode = "reduced" | "full";

export const motionPreferenceOrder: MotionPreference[] = [
  "system",
  "reduced",
  "full",
];

export const motionTokens = {
  hover: 0.14,
  press: 0.1,
  selection: 0.26,
  pathHighlight: 0.18,
  panel: 0.22,
  camera: 0.28,
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
        boxShadow: "0 22px 40px -30px rgba(34, 74, 86, 0.45)",
        transition: { duration: motionTokens.hover, ease: easeOut },
      }
    : {
        boxShadow: "0 24px 48px -30px rgba(34, 74, 86, 0.48)",
        transition: { duration: motionTokens.hover, ease: easeOut },
        y: -4,
      };
}

export function getNodePressAnimation(mode: MotionMode) {
  return mode === "reduced"
    ? {
        opacity: 0.96,
        transition: { duration: motionTokens.press, ease: easeOut },
      }
    : {
        scale: 0.985,
        transition: { duration: motionTokens.press, ease: easeOut },
        y: -1,
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
    duration: mode === "reduced" ? 0.18 : motionTokens.panel,
    ease: easeOut,
  } as const;
}

export function getCameraDuration(mode: MotionMode) {
  return mode === "reduced" ? 0 : motionTokens.camera;
}
