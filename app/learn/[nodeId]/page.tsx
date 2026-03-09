import { notFound } from "next/navigation";
import { LearnWorkspace } from "@/components/learn/learn-workspace";
import { getMlNode, mlFundamentalsGraph } from "@/data/ml-fundamentals";

export function generateStaticParams() {
  return mlFundamentalsGraph.nodes.map((node) => ({
    nodeId: node.id,
  }));
}

export default async function LearnNodePage({
  params,
}: {
  params: Promise<{ nodeId: string }>;
}) {
  const { nodeId } = await params;
  const node = getMlNode(nodeId);

  if (!node) {
    notFound();
  }

  return <LearnWorkspace initialNodeId={node.id} />;
}
