import { notFound } from 'next/navigation';
import { getAgentBySlug, getAgentBuybacks, mockAgents } from '@/lib/mock-data';
import { AgentDetailClient } from './AgentDetailClient';
import { PreIcoAgentDetailClient } from '@/components/agents/PreIcoAgentDetailClient';
import { preIcoAgents } from '@/lib/pre-ico-agents';

export function generateStaticParams() {
  return [...mockAgents.map((agent) => ({ slug: agent.slug })), ...Object.keys(preIcoAgents).map((slug) => ({ slug }))];
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preIcoAgent = preIcoAgents[slug];
  if (preIcoAgent) return <PreIcoAgentDetailClient agent={preIcoAgent} />;

  const agent = getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  const buybacks = getAgentBuybacks(agent.id);

  return <AgentDetailClient agent={agent} buybacks={buybacks} />;
}
