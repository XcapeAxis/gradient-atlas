import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { publishedGraphs } from "@/data/published-graphs";

export function GalleryOverview() {
  return (
    <AppShell
      center={
        <div className="grid gap-4 xl:grid-cols-2">
          {publishedGraphs.map((graphEntry, index) => (
            <Card className="surface-panel overflow-hidden" key={graphEntry.slug}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xl">{graphEntry.title}</CardTitle>
                  {index === 0 ? <Badge variant="secondary">Featured</Badge> : null}
                </div>
                <CardDescription>{graphEntry.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{graphEntry.graph.nodes.length} nodes</Badge>
                  <Badge variant="outline">{graphEntry.graph.edges.length} edges</Badge>
                  <Badge variant="outline">
                    {graphEntry.graph.starterPaths.length} starter paths
                  </Badge>
                </div>
                <p>{graphEntry.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/graphs/${graphEntry.slug}` as Route}>Open viewer</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={"/studio" as Route}>Open local studio</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
      currentSection="gallery"
      description="The gallery is file-backed for phase 1: every published atlas pack lives in local source data and can be opened in a read-only viewer or loaded into the local studio."
      rightPanel={
        <>
          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Local publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Published packs are plain local data files that share the same runtime
                schema as the study experience and the studio.
              </p>
              <p>
                Phase 1 keeps everything local-first: no accounts, backend, or hosted
                publishing flow yet.
              </p>
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Next step</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Use the studio to edit a pack, validate it against the shared schema,
                and export JSON for manual publishing.
              </p>
            </CardContent>
          </Card>
        </>
      }
      sectionEyebrow="Published atlases"
      title="Local gallery"
    />
  );
}
