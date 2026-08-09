import { createDb } from './client.js';
import {
  users,
  wallets,
  agents,
  agentTeamMembers,
  agentDocuments,
  icos,
  contributions,
  buybackEvents,
  vestingSchedules,
} from './schema/index.js';

/**
 * Seed the database with mock data for UI development.
 * Creates 3 mock agents:
 * - One with ICO Live status
 * - One Trading with buyback events
 * - One Seed tier upcoming ICO
 */
async function seed() {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://localhost:5432/arca';

  console.log('🌱 Seeding database...');
  const db = createDb(connectionString);

  try {
    // Create a mock deployer user
    const [deployerUser] = await db
      .insert(users)
      .values({
        role: 'deployer',
      })
      .returning();

    console.log('✓ Created deployer user');

    // Create deployer wallet
    await db.insert(wallets).values({
      userId: deployerUser.id,
      chain: 'solana',
      address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
      isPrimary: true,
      verifiedAt: new Date(),
    });

    console.log('✓ Created deployer wallet');

    // Agent 1: ICO Live - Core tier
    const [agent1] = await db
      .insert(agents)
      .values({
        slug: 'quantum-trader-pro',
        name: 'Quantum Trader Pro',
        description:
          'Advanced AI trading agent utilizing quantum-inspired algorithms for optimal market execution across DeFi protocols.',
        oneLiner: 'Quantum-inspired DeFi trading with proven 78% win rate',
        logoUrl: '/logos/quantum-trader.png',
        category: 'Trading',
        tier: 'core',
        riskRating: 'medium',
        status: 'IcoLive',
        chain: 'solana',
        website: 'https://quantumtrader.ai',
        docsUrl: 'https://docs.quantumtrader.ai',
        socials: {
          twitter: 'https://twitter.com/quantumtrader',
          discord: 'https://discord.gg/quantumtrader',
        },
        launchFdvUsd: '500000',
        raiseTargetUsd: '50000',
        raiseThresholdBps: 5000,
        minTicketNative: '0.1',
        icoAddress: 'EzQT9KZHgs5JVYxobLrVHjLx5cZC7hBJDg4q9hQFGLko',
        operationalWalletAddress: 'FwRYtTPRk5N4wUeP87rTw62Zcs4ZYFwqwBh5xWQCDjsY',
        createdByUserId: deployerUser.id,
      })
      .returning();

    console.log('✓ Created agent 1 (ICO Live)');

    // Add team members for agent 1
    await db.insert(agentTeamMembers).values([
      {
        agentId: agent1.id,
        name: 'Dr. Sarah Chen',
        role: 'Lead AI Engineer',
        profileUrl: 'https://linkedin.com/in/sarahchen',
      },
      {
        agentId: agent1.id,
        name: 'Marcus Rodriguez',
        role: 'Quantitative Strategist',
        profileUrl: 'https://linkedin.com/in/marcusrodriguez',
      },
    ]);

    // Add documents for agent 1
    await db.insert(agentDocuments).values([
      {
        agentId: agent1.id,
        type: 'strategy',
        url: 'https://docs.quantumtrader.ai/strategy.pdf',
      },
      {
        agentId: agent1.id,
        type: 'audit',
        url: 'https://audits.quantumtrader.ai/report-v1.pdf',
      },
    ]);

    // Create ICO for agent 1
    const [ico1] = await db
      .insert(icos)
      .values({
        agentId: agent1.id,
        startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
        endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Ends in 5 days
        totalRaisedNative: '32.5',
        contributorCount: 47,
      })
      .returning();

    // Add some contributions
    await db.insert(contributions).values([
      {
        icoId: ico1.id,
        walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        amountNative: '2.5',
        txHash: '5Jv7xN9YqPzQ1MvhRkZPH3WX2cA8gT6hFsD4jK9LmNpU',
      },
      {
        icoId: ico1.id,
        walletAddress: 'C1onEW2kPdAXYRHLvjA4RdcVqGWGZQrN5z6XfM3hYzqV',
        amountNative: '5.0',
        txHash: '3ZxC2rP9tQvA8mNjHkF7sY1wD6eG5bL4xK8uR2pTvNmW',
      },
    ]);

    console.log('✓ Created ICO and contributions for agent 1');

    // Agent 2: Trading with buyback events - Pro tier
    const [agent2] = await db
      .insert(agents)
      .values({
        slug: 'alpha-yield-optimizer',
        name: 'Alpha Yield Optimizer',
        description:
          'Institutional-grade yield optimization agent that dynamically allocates capital across lending protocols and liquidity pools.',
        oneLiner: 'Institutional yield farming with automated risk management',
        logoUrl: '/logos/alpha-yield.png',
        category: 'Yield',
        tier: 'pro',
        riskRating: 'low',
        status: 'Trading',
        chain: 'robinhood',
        website: 'https://alphayield.io',
        docsUrl: 'https://docs.alphayield.io',
        socials: {
          twitter: 'https://twitter.com/alphayield',
          telegram: 'https://t.me/alphayield',
        },
        launchFdvUsd: '1200000',
        raiseTargetUsd: '120000',
        raiseThresholdBps: 6000,
        minTicketNative: '0.05',
        tokenAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        icoAddress: '0xA8B3d9c12F5e8b3C7D6E4f5A6B8C9D0E1F2A3B4C',
        buybackAddress: '0xD2E4f6A8B0C2D4E6F8A0C2E4F6A8B0C2D4E6F8A0',
        agentWalletAddress: '0xE3F5A7B9C1D3E5F7A9B1C3D5E7F9A1B3C5D7E9F1',
        operationalWalletAddress: '0xF4A6B8C0D2E4F6A8B0C2D4E6F8A0B2C4D6E8F0A2',
        createdByUserId: deployerUser.id,
      })
      .returning();

    console.log('✓ Created agent 2 (Trading with buybacks)');

    // Add team members for agent 2
    await db.insert(agentTeamMembers).values([
      {
        agentId: agent2.id,
        name: 'Alex Thompson',
        role: 'CEO & Co-founder',
        profileUrl: 'https://linkedin.com/in/alexthompson',
      },
      {
        agentId: agent2.id,
        name: 'Priya Patel',
        role: 'Chief Risk Officer',
        profileUrl: 'https://linkedin.com/in/priyapatel',
      },
      {
        agentId: agent2.id,
        name: 'James Wu',
        role: 'Smart Contract Engineer',
        profileUrl: 'https://linkedin.com/in/jameswu',
      },
    ]);

    // Add documents for agent 2
    await db.insert(agentDocuments).values([
      {
        agentId: agent2.id,
        type: 'strategy',
        url: 'https://docs.alphayield.io/strategy-whitepaper.pdf',
      },
      {
        agentId: agent2.id,
        type: 'audit',
        url: 'https://audits.alphayield.io/certik-audit.pdf',
      },
    ]);

    // Create completed ICO for agent 2
    await db.insert(icos).values({
      agentId: agent2.id,
      startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endsAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), // Ended 23 days ago
      totalRaisedNative: '2.8',
      contributorCount: 156,
      finalizedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      outcome: 'success',
    });

    // Add vesting schedule
    await db.insert(vestingSchedules).values({
      agentId: agent2.id,
      cliffSeconds: 365 * 24 * 60 * 60, // 1 year cliff
      durationSeconds: 4 * 365 * 24 * 60 * 60, // 4 year linear
      beneficiary: deployerUser.id,
    });

    // Add buyback events for agent 2
    await db.insert(buybackEvents).values([
      {
        agentId: agent2.id,
        chain: 'robinhood',
        txHash:
          '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        revenueSpent: '0.5',
        agentTokensBought: '125000',
        platformTokensBought: '12500',
        blockTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        agentId: agent2.id,
        chain: 'robinhood',
        txHash:
          '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
        revenueSpent: '0.75',
        agentTokensBought: '187500',
        platformTokensBought: '18750',
        blockTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        agentId: agent2.id,
        chain: 'robinhood',
        txHash:
          '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
        revenueSpent: '1.2',
        agentTokensBought: '300000',
        platformTokensBought: '30000',
        blockTime: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        agentId: agent2.id,
        chain: 'robinhood',
        txHash:
          '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
        revenueSpent: '0.9',
        agentTokensBought: '225000',
        platformTokensBought: '22500',
        blockTime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('✓ Created buyback events for agent 2');

    // Agent 3: ICO Upcoming - Seed tier
    const [agent3] = await db
      .insert(agents)
      .values({
        slug: 'sentiment-prophet',
        name: 'Sentiment Prophet',
        description:
          'Early-stage AI agent leveraging social sentiment analysis and on-chain metrics to predict market movements.',
        oneLiner: 'Social sentiment meets on-chain analytics',
        logoUrl: '/logos/sentiment-prophet.png',
        category: 'Prediction',
        tier: 'seed',
        riskRating: 'high',
        status: 'IcoUpcoming',
        chain: 'solana',
        website: 'https://sentimentprophet.io',
        socials: {
          twitter: 'https://twitter.com/sentimentprophet',
        },
        launchFdvUsd: '150000',
        raiseTargetUsd: '15000',
        raiseThresholdBps: 5000,
        minTicketNative: '0.05',
        operationalWalletAddress: 'GjQX5eB9pFhPzR2vN8wK7dL3mT6sC4xY1aH9fE2bD5uW',
        createdByUserId: deployerUser.id,
      })
      .returning();

    console.log('✓ Created agent 3 (ICO Upcoming)');

    // Add team member for agent 3
    await db.insert(agentTeamMembers).values([
      {
        agentId: agent3.id,
        name: 'Dev Anon',
        role: 'Founder & Developer',
      },
    ]);

    // Add strategy doc for agent 3
    await db.insert(agentDocuments).values([
      {
        agentId: agent3.id,
        type: 'strategy',
        url: 'https://docs.sentimentprophet.io/strategy.pdf',
      },
    ]);

    // Create upcoming ICO for agent 3
    await db.insert(icos).values({
      agentId: agent3.id,
      startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Starts in 3 days
      endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Ends in 10 days
      totalRaisedNative: '0',
      contributorCount: 0,
    });

    console.log('✓ Created upcoming ICO for agent 3');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nCreated:');
    console.log('- 1 deployer user');
    console.log('- 1 wallet');
    console.log('- 3 agents (ICO Live, Trading, ICO Upcoming)');
    console.log('- Team members and documents');
    console.log('- ICOs with contributions');
    console.log('- 4 buyback events for the Trading agent');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
