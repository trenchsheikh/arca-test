import { notFound } from 'next/navigation';
import { getAgentBySlug, getAgentBuybacks, mockAgents } from '@/lib/mock-data';
import { AgentDetailClient } from './AgentDetailClient';

export function generateStaticParams() {
  return mockAgents.map((agent) => ({ slug: agent.slug }));
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
