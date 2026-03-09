import type { ReactNode } from "react";
import { LeftRail } from "@/components/layout/left-rail";
import type { AppSection } from "@/components/layout/navigation";
import { TopBar } from "@/components/layout/top-bar";

interface AppShellProps {
  center: ReactNode;
  currentSection: AppSection;
  description: string;
  headerTop?: ReactNode;
  leftRail?: ReactNode;
  sectionEyebrow?: string;
  rightPanel: ReactNode;
  rightPanelLabel?: string;
  title: string;
}

export function AppShell({
  center,
  currentSection,
  description,
  headerTop,
  leftRail,
  sectionEyebrow = "Gradient Atlas",
  rightPanel,
  rightPanelLabel = "Details",
  title,
}: AppShellProps) {
  return (
    <div className="min-h-screen">
      <a
        className="sr-only left-4 top-4 z-50 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow-soft focus:not-sr-only focus:absolute"
        href="#main-content"
      >
        Skip to content
      </a>

      <TopBar currentSection={currentSection} />

      <main
        className="mx-auto grid max-w-[1600px] gap-4 px-4 pb-8 pt-5 lg:grid-cols-[260px,minmax(0,1fr)] xl:grid-cols-[260px,minmax(0,1fr),320px]"
        id="main-content"
      >
        <aside aria-label="Study navigation">
          {leftRail ?? <LeftRail currentSection={currentSection} />}
        </aside>

        <section aria-labelledby="page-title" className="space-y-4">
          <div className="surface-panel px-6 py-5 sm:px-8">
            {headerTop ? <div className="mb-5">{headerTop}</div> : null}
            <p className="font-display text-xs uppercase tracking-[0.32em] text-primary">
              {sectionEyebrow}
            </p>
            <h1
              className="mt-3 font-display text-3xl text-foreground sm:text-4xl"
              id="page-title"
            >
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </div>

          {center}
        </section>

        <aside
          aria-label={rightPanelLabel}
          className="space-y-4 xl:sticky xl:top-24 xl:h-fit"
        >
          {rightPanel}
        </aside>
      </main>
    </div>
  );
}
