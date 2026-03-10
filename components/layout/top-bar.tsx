import Link from "next/link";
import { MotionPreferenceToggle } from "@/components/layout/motion-preference-toggle";
import { appNavItems, type AppSection } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export function TopBar({ currentSection }: { currentSection: AppSection }) {
  const primaryNavItems = appNavItems.filter((item) =>
    ["home", "map", "learn"].includes(item.id),
  );
  const secondaryNavItems = appNavItems.filter((item) =>
    ["studio", "gallery"].includes(item.id),
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <Link
              className="font-display text-xl text-foreground transition-colors hover:text-primary"
              href="/"
            >
              Gradient Atlas
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              ML fundamentals
            </p>
          </div>

          <nav aria-label="Primary" className="flex flex-wrap items-center gap-1">
            {primaryNavItems.map((item) => (
              <Link
                aria-current={item.id === currentSection ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition-colors",
                  item.id === currentSection
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                href={item.href}
                key={item.id}
              >
                {item.label}
              </Link>
            ))}
            <div className="mx-1 hidden h-4 w-px bg-border/80 md:block" />
            <div className="flex items-center gap-1">
              {secondaryNavItems.map((item) => (
                <Link
                  aria-current={item.id === currentSection ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm transition-colors",
                    item.id === currentSection
                      ? "bg-secondary/80 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  href={item.href}
                  key={item.id}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex justify-end">
          <MotionPreferenceToggle />
        </div>
      </div>
    </header>
  );
}
