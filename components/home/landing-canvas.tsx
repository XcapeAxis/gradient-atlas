"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FocusedGraphCanvas } from "@/components/graph/focused-graph";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  mlFundamentalsGraph,
  mlFundamentalsStarterPaths,
} from "@/data/ml-fundamentals";

export function LandingCanvas() {
  return (
    <div className="space-y-4">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel overflow-hidden px-6 py-8 sm:px-8"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Curriculum pack loaded</Badge>
              <Badge variant="outline">{mlFundamentalsGraph.nodes.length} nodes</Badge>
              <Badge variant="outline">{mlFundamentalsGraph.edges.length} edges</Badge>
            </div>
            <div className="space-y-4">
              <h2 className="max-w-3xl font-display text-4xl leading-tight text-foreground">
                Study machine learning fundamentals through a curated local
                curriculum graph.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                The first real content pack now spans foundations, data
                splitting, linear models, evaluation, tree ensembles,
                unsupervised learning, and one neural-network preview gateway.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/map">Open overview</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/learn/linear-regression">Enter learn route</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {mlFundamentalsStarterPaths.map((path, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 10 }}
                key={path.id}
                transition={{ delay: index * 0.06, duration: 0.28 }}
              >
                <Card className="h-full border-border/80 bg-card/80">
                  <CardContent className="space-y-2 p-5">
                    <p className="font-display text-xl text-foreground">
                      {path.title}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {path.summary}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <FocusedGraphCanvas
        description="The preview shows a focused neighborhood around a selected concept instead of the entire curriculum at once."
        graph={mlFundamentalsGraph}
        headline="ML fundamentals preview"
        selectedNodeId="linear-regression"
        supportingText="The content pack is larger now, so the graph view stays local by default and keeps only the nearby concepts in frame."
      />
    </div>
  );
}
