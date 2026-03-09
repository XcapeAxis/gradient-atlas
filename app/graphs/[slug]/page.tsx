import { notFound } from "next/navigation";
import { PublishedGraphViewer } from "@/components/gallery/published-graph-viewer";
import { getPublishedGraph, publishedGraphs } from "@/data/published-graphs";

export function generateStaticParams() {
  return publishedGraphs.map((graphEntry) => ({
    slug: graphEntry.slug,
  }));
}

export default async function PublishedGraphPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const graphEntry = getPublishedGraph(slug);

  if (!graphEntry) {
    notFound();
  }

  return <PublishedGraphViewer graphEntry={graphEntry} />;
}
