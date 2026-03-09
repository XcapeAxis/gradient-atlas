import Link from "next/link";
import { appNavItems, type AppSection } from "@/components/layout/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const checkpoints = [
  "App shell with top bar, rail, canvas, and detail zones",
  "Landing, map, and learn placeholders",
  "Typed graph schema and starter data",
  "Testing, lint, typecheck, and build wiring",
];

const keyboardBasics = [
  "Use Tab to move between shell links and controls.",
  "Follow visible focus rings through the shell landmarks.",
  "Switch motion modes from the top bar when needed.",
];

export function LeftRail({ currentSection }: { currentSection: AppSection }) {
  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <Card className="surface-panel">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Routes</CardTitle>
            <Badge variant="outline">Curated</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {appNavItems.map((item) => (
            <Link
              aria-current={item.id === currentSection ? "page" : undefined}
              className={cn(
                "block rounded-lg border border-transparent px-3 py-3 transition-colors duration-fast hover:border-border hover:bg-secondary/40",
                item.id === currentSection &&
                  "border-primary/30 bg-primary/10 text-foreground shadow-soft",
              )}
              href={item.href}
              key={item.id}
            >
              <p className="font-medium">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="text-base">Milestone checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="space-y-2">
            {checkpoints.map((item) => (
              <li className="flex gap-2" key={item}>
                <span aria-hidden="true" className="text-primary">
                  01
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="text-base">Keyboard basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {keyboardBasics.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
