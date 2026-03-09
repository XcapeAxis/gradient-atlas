"use client";

import { useMotionSettings } from "@/components/providers/motion-provider";
import { Button } from "@/components/ui/button";
import { useUiPreferencesStore } from "@/stores/ui-preferences";

const labels = {
  system: "System",
  reduced: "Reduced",
  full: "Full",
} as const;

export function MotionPreferenceToggle() {
  const motionPreference = useUiPreferencesStore((state) => state.motionPreference);
  const setMotionPreference = useUiPreferencesStore(
    (state) => state.setMotionPreference,
  );
  const { motionMode } = useMotionSettings();

  return (
    <div className="rounded-full border border-border/80 bg-background/85 p-1 shadow-soft">
      <div className="flex items-center gap-1">
        {Object.entries(labels).map(([value, label]) => (
          <Button
            aria-label={`Motion preference: ${label}`}
            className="min-w-20"
            key={value}
            onClick={() =>
              setMotionPreference(value as keyof typeof labels)
            }
            size="sm"
            type="button"
            variant={motionPreference === value ? "default" : "ghost"}
          >
            {label}
          </Button>
        ))}
        <span className="px-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {motionMode}
        </span>
      </div>
    </div>
  );
}
