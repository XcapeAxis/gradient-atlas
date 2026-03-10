import type { ReactNode } from "react";
import type { AppSection } from "@/components/layout/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  center: ReactNode;
  currentSection: AppSection;
  description?: string;
  headerTop?: ReactNode;
  leftRail?: ReactNode;
  rightPanel?: ReactNode;
  rightPanelLabel?: string;
  sectionEyebrow?: string;
  title: string;
}

export function AppShell({
  center,
  currentSection,
  description,
  headerTop,
  leftRail,
  rightPanel,
  rightPanelLabel = "Details",
  sectionEyebrow = "Gradient Atlas",
  title,
}: AppShellProps) {
  const hasLeftRail = Boolean(leftRail);
  const hasRightPanel = Boolean(rightPanel);

  return (
    <div className="min-h-screen">
      <a
        className="sr-only left-4 top-4 z-50 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow-soft focus:not-sr-only focus:absolute"
        href="#main-content"
      >
        Skip to content
      </a>

      <TopBar currentSection={currentSection} />

      <main className="mx-auto max-w-[1480px] px-5 pb-10 pt-8" id="main-content">
        <section className="space-y-4">
          <p className="quiet-label">{sectionEyebrow}</p>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-3">
              <h1 className="font-display text-4xl leading-tight text-foreground sm:text-[3.35rem]">
                {title}
              </h1>
              {description ? (
                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            {headerTop ? <div className="w-full max-w-3xl">{headerTop}</div> : null}
          </div>
        </section>

        <div
          className={cn(
            "mt-8 grid gap-6",
            hasLeftRail && hasRightPanel
              ? "xl:grid-cols-[240px,minmax(0,1fr),320px]"
              : hasLeftRail
                ? "xl:grid-cols-[240px,minmax(0,1fr)]"
                : hasRightPanel
                  ? "xl:grid-cols-[minmax(0,1fr),320px]"
                  : "grid-cols-1",
          )}
        >
          {hasLeftRail ? (
            <aside aria-label="Page controls" className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
              {leftRail}
            </aside>
          ) : null}

          <section className="min-w-0">{center}</section>

          {hasRightPanel ? (
            <aside
              aria-label={rightPanelLabel}
              className="space-y-4 xl:sticky xl:top-24 xl:h-fit"
            >
              {rightPanel}
            </aside>
          ) : null}
        </div>
      </main>
    </div>
  );
}
