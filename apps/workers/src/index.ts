import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Create Redis connections
const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

const redisPublisher = new Redis(REDIS_URL);

console.log(`Connected to Redis at ${REDIS_URL}`);

// Define queue names
export const QUEUE_NAMES = {
  BUYBACK_KEEPER: "buyback-keeper",
  FINALIZE_ICO: "finalize-ico",
  REFUND_ICO: "refund-ico",
  INDEX_EVM_LOGS: "index-evm-logs",
  INDEX_SOLANA: "index-solana",
  SYNC_REVENUE_WALLETS: "sync-revenue-wallets",
} as const;

// Create queues
const buybackKeeperQueue = new Queue(QUEUE_NAMES.BUYBACK_KEEPER, { connection });
const finalizeIcoQueue = new Queue(QUEUE_NAMES.FINALIZE_ICO, { connection });
const refundIcoQueue = new Queue(QUEUE_NAMES.REFUND_ICO, { connection });
const indexEvmLogsQueue = new Queue(QUEUE_NAMES.INDEX_EVM_LOGS, { connection });
const indexSolanaQueue = new Queue(QUEUE_NAMES.INDEX_SOLANA, { connection });
const syncRevenueWalletsQueue = new Queue(QUEUE_NAMES.SYNC_REVENUE_WALLETS, { connection });

console.log("Queues created");

// Import processors
import { buybackKeeperProcessor } from "./processors/buyback-keeper.js";
import { finalizeIcoProcessor } from "./processors/finalize-ico.js";
import { refundIcoProcessor } from "./processors/refund-ico.js";
import { indexEvmLogsProcessor } from "./processors/index-evm-logs.js";
import { indexSolanaProcessor } from "./processors/index-solana.js";
import { syncRevenueWalletsProcessor } from "./processors/sync-revenue-wallets.js";

// Create workers
const workers = [
  new Worker(
    QUEUE_NAMES.BUYBACK_KEEPER,
    async (job) => buybackKeeperProcessor(job, redisPublisher),
    { connection }
  ),
  new Worker(QUEUE_NAMES.FINALIZE_ICO, finalizeIcoProcessor, { connection }),
  new Worker(QUEUE_NAMES.REFUND_ICO, refundIcoProcessor, { connection }),
  new Worker(QUEUE_NAMES.INDEX_EVM_LOGS, indexEvmLogsProcessor, { connection }),
  new Worker(QUEUE_NAMES.INDEX_SOLANA, indexSolanaProcessor, { connection }),
  new Worker(QUEUE_NAMES.SYNC_REVENUE_WALLETS, syncRevenueWalletsProcessor, { connection }),
];

console.log(`Started ${workers.length} workers`);

// Worker event handlers
workers.forEach((worker, index) => {
  worker.on("completed", (job) => {
    console.log(`[${job.queueName}] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[${job?.queueName}] Job ${job?.id} failed:`, err.message);
  });
});

// Register repeatable jobs
const BUYBACK_FREQUENCY = process.env.BUYBACK_FREQUENCY_MINUTES
  ? parseInt(process.env.BUYBACK_FREQUENCY_MINUTES, 10) * 60 * 1000
  : 60 * 60 * 1000; // Default: 1 hour

await buybackKeeperQueue.add(
  "periodic-buyback-check",
  {},
  {
    repeat: {
      every: BUYBACK_FREQUENCY,
    },
  }
);

console.log(`Registered buyback keeper cron (every ${BUYBACK_FREQUENCY / 1000 / 60} minutes)`);

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down workers...");
  await Promise.all(workers.map((w) => w.close()));
  await connection.quit();
  await redisPublisher.quit();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log("Workers ready. Press Ctrl+C to exit.");
