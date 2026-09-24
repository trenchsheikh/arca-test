import { notFound } from 'next/navigation';
import { getAgentBySlug, getAgentBuybacks, mockAgents } from '@/lib/mock-data';
import { AgentDetailClient } from './AgentDetailClient';
import { ApolloPage } from '@/components/agents/ApolloPage';

export function generateStaticParams() {
  return [...mockAgents.map((agent) => ({ slug: agent.slug })), { slug: 'apollo' }];
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === 'apollo') return <ApolloPage />;

  const agent = getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  const buybacks = getAgentBuybacks(agent.id);

  return <AgentDetailClient agent={agent} buybacks={buybacks} />;
}
