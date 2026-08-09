# @arca/ws — WebSocket Service

Dedicated WebSocket service for live buyback feed and ICO progress updates.

## Features

- **WebSocket channels** for real-time updates:
  - `agent:{id}:buybacks` — Buyback events
  - `ico:{id}:progress` — ICO progress
- **Redis pub/sub integration** (optional): If `REDIS_URL` is set, subscribes to `arca:buybacks` and `arca:ico-progress` and fans out to WebSocket clients
- **Demo publisher**: If Redis is not configured, emits sample `BuybackExecuted` payloads every 20 seconds for `demo-agent-1`
- **Health check**: `GET /health` (or on separate port via `HEALTH_PORT`)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WS_PORT` | `3001` | WebSocket server port |
| `HEALTH_PORT` | `3002` | Health check port (optional, defaults to WS_PORT) |
| `REDIS_URL` | (optional) | Redis connection URL. If not set, uses demo publisher |

## Scripts

```bash
pnpm dev        # Watch mode with tsx
pnpm start      # Production mode
pnpm typecheck  # Type checking
```

## Usage

### Subscribe to a channel

Send a JSON message to the WebSocket:

```json
{
  "type": "subscribe",
  "channel": "agent:demo-agent-1:buybacks"
}
```

You'll receive a confirmation:

```json
{
  "type": "subscribed",
  "channel": "agent:demo-agent-1:buybacks"
}
```

### Receive updates

When buyback events occur (or demo events are published), you'll receive messages like:

```json
{
  "agentId": "demo-agent-1",
  "txHash": "0x...",
  "revenueSpent": "1.5 ETH",
  "agentTokensBought": "45000 AGENT",
  "platformTokensBought": "5000 ARCA",
  "timestamp": "2026-08-05T02:30:00.000Z"
}
```

### Dev publish endpoint (no Redis)

When Redis is not configured, you can manually publish to channels:

```bash
curl -X POST http://localhost:3001/dev/publish \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "agent:demo-agent-1:buybacks",
    "payload": {
      "agentId": "demo-agent-1",
      "txHash": "0xabc123",
      "revenueSpent": "2.0 ETH",
      "agentTokensBought": "60000 AGENT",
      "platformTokensBought": "6667 ARCA",
      "timestamp": "2026-08-05T03:00:00.000Z"
    }
  }'
```

## Architecture

```
┌──────────────┐         ┌──────────────┐
│  Redis Pub   │────────>│  @arca/ws    │
│  (workers)   │         │   Server     │
└──────────────┘         └──────┬───────┘
                                 │
                        WebSocket broadcasts
                                 │
                    ┌────────────┼────────────┐
                    v            v            v
                ┌────────┐  ┌────────┐  ┌────────┐
                │ Client │  │ Client │  │ Client │
                └────────┘  └────────┘  └────────┘
```

## Production Deployment

- Set `REDIS_URL` to connect to Redis pub/sub
- Configure workers (e.g., `@arca/workers`) to publish to `arca:buybacks` and `arca:ico-progress`
- Deploy as a persistent process (e.g., Fly.io, Railway)
- Use separate `HEALTH_PORT` for load balancer health checks if needed
