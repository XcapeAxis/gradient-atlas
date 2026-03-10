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
    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/85 p-1 shadow-soft">
      <span className="hidden px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:inline">
        Motion
      </span>
      <div className="flex items-center gap-1">
        {Object.entries(labels).map(([value, label]) => (
          <Button
            aria-label={`Motion preference: ${label}`}
            className="min-w-[3.7rem] rounded-full px-3"
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
      </div>
      <span className="hidden pr-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground md:inline">
        {motionMode}
      </span>
    </div>
  );
}
