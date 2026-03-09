import Link from "next/link";
import { MotionPreferenceToggle } from "@/components/layout/motion-preference-toggle";
import { appNavItems, type AppSection } from "@/components/layout/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TopBar({ currentSection }: { currentSection: AppSection }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 font-display text-sm uppercase tracking-[0.24em] text-primary">
            Gradient Atlas
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg text-foreground">
                Machine learning as a local study graph
              </p>
              <Badge variant="secondary">Phase 1</Badge>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Local-first learning, navigation, and authoring for a curated
              machine-learning atlas with calm motion and readable graph views.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-2">
            {appNavItems.map((item) => (
              <Button
                asChild
                key={item.id}
                size="sm"
                variant={item.id === currentSection ? "default" : "ghost"}
              >
                <Link
                  aria-current={item.id === currentSection ? "page" : undefined}
                  className={cn(
                    "justify-start",
                    item.id !== currentSection && "text-muted-foreground",
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
          <MotionPreferenceToggle />
        </div>
      </div>
    </header>
  );
}
