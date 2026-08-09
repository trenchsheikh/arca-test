import { notFound } from 'next/navigation';
import { getAgentBySlug, getAgentBuybacks } from '@/lib/mock-data';
import { AgentDetailClient } from './AgentDetailClient';

export async function generateStaticParams() {
  return [
    { slug: 'quantum-flux' },
    { slug: 'arbitrage-alpha' },
    { slug: 'yield-optimizer' },
    { slug: 'prediction-nexus' },
  ];
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  const buybacks = getAgentBuybacks(agent.id);

  return <AgentDetailClient agent={agent} buybacks={buybacks} />;
}
