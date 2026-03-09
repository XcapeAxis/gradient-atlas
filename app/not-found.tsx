import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <AppShell
      center={
        <Card className="surface-panel">
          <CardHeader>
            <CardTitle>Node not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The requested learning node is not part of the current Gradient Atlas
              curriculum pack.
            </p>
            <Button asChild>
              <Link href="/map">Return to the atlas map</Link>
            </Button>
          </CardContent>
        </Card>
      }
      currentSection="learn"
      description="This fallback keeps the shared shell intact when a requested concept slug is missing."
      rightPanel={null}
      title="Learning route fallback"
    />
  );
}
