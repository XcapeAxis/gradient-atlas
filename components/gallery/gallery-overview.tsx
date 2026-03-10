import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { publishedGraphs } from "@/data/published-graphs";

export function GalleryOverview() {
  return (
    <AppShell
      center={
        <div className="grid gap-4 xl:grid-cols-2">
          {publishedGraphs.map((graphEntry) => (
            <section className="surface-panel space-y-4 p-6" key={graphEntry.slug}>
              <div className="space-y-2">
                <p className="quiet-label">Published pack</p>
                <h2 className="font-display text-3xl text-foreground">{graphEntry.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {graphEntry.summary}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                {graphEntry.graph.nodes.length} nodes · {graphEntry.graph.edges.length} edges ·{" "}
                {graphEntry.graph.starterPaths.length} starter paths
              </p>

              <p className="text-sm leading-6 text-muted-foreground">
                {graphEntry.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={`/graphs/${graphEntry.slug}` as Route}>Open viewer</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={"/studio" as Route}>Open studio</Link>
                </Button>
              </div>
            </section>
          ))}
        </div>
      }
      currentSection="gallery"
      description="Browse file-backed packs locally, then open them in the read-only viewer or load the authoring studio."
      sectionEyebrow="Published atlases"
      title="Local gallery"
    />
  );
}
