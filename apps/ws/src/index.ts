import { WebSocketServer } from "ws";
import { createServer } from "http";
import Redis from "ioredis";

const PORT = parseInt(process.env.WS_PORT || "3001", 10);
const HEALTH_PORT = parseInt(process.env.HEALTH_PORT || "3002", 10);
const REDIS_URL = process.env.REDIS_URL;

// WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Redis pub/sub clients (only if REDIS_URL is set)
let redisSub: Redis | null = null;
let redisPub: Redis | null = null;

if (REDIS_URL) {
  redisSub = new Redis(REDIS_URL);
  redisPub = new Redis(REDIS_URL);

  redisSub.subscribe("arca:buybacks", "arca:ico-progress", (err, count) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    } else {
      console.log(`Subscribed to ${count} Redis channels`);
    }
  });

  redisSub.on("message", (channel, message) => {
    console.log(`Redis message on ${channel}:`, message);
    
    try {
      const data = JSON.parse(message);
      
      // Fan out to subscribed WebSocket clients
      if (channel === "arca:buybacks") {
        broadcastToChannel(`agent:${data.agentId}:buybacks`, message);
      } else if (channel === "arca:ico-progress") {
        broadcastToChannel(`ico:${data.icoId}:progress`, message);
      }
    } catch (e) {
      console.error("Failed to parse Redis message:", e);
    }
  });
}

// Track subscriptions: Map<channelName, Set<WebSocket>>
const subscriptions = new Map<string, Set<any>>();

function broadcastToChannel(channel: string, message: string) {
  const clients = subscriptions.get(channel);
  if (clients) {
    clients.forEach((ws) => {
      if (ws.readyState === 1) { // OPEN
        ws.send(message);
      }
    });
  }
}

wss.on("connection", (ws) => {
  console.log("Client connected");
  const clientChannels = new Set<string>();

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      if (msg.type === "subscribe" && msg.channel) {
        const channel = msg.channel;
        clientChannels.add(channel);
        
        if (!subscriptions.has(channel)) {
          subscriptions.set(channel, new Set());
        }
        subscriptions.get(channel)!.add(ws);
        
        console.log(`Client subscribed to: ${channel}`);
        ws.send(JSON.stringify({ type: "subscribed", channel }));
      }
    } catch (e) {
      console.error("Invalid message:", e);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    // Clean up subscriptions
    clientChannels.forEach((channel) => {
      const clients = subscriptions.get(channel);
      if (clients) {
        clients.delete(ws);
        if (clients.size === 0) {
          subscriptions.delete(channel);
        }
      }
    });
  });
});

// Main HTTP server for WebSocket upgrade
const server = createServer((req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", connections: wss.clients.size }));
  } else if (!REDIS_URL && req.url === "/dev/publish" && req.method === "POST") {
    // Dev-only HTTP endpoint for manual publishing when Redis is not available
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const channel = data.channel;
        const payload = JSON.stringify(data.payload);
        
        broadcastToChannel(channel, payload);
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// Demo publisher: emit sample BuybackExecuted payloads every 20s if Redis not configured
if (!REDIS_URL) {
  console.log("Redis not configured. Starting demo publisher (20s interval)...");
  
  setInterval(() => {
    const demoAgentId = "demo-agent-1";
    const demoPayload = {
      agentId: demoAgentId,
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      revenueSpent: "1.5 ETH",
      agentTokensBought: "45000 AGENT",
      platformTokensBought: "5000 ARCA",
      timestamp: new Date().toISOString(),
    };
    
    const channel = `agent:${demoAgentId}:buybacks`;
    const message = JSON.stringify(demoPayload);
    
    console.log(`Demo publish to ${channel}:`, message);
    broadcastToChannel(channel, message);
  }, 20_000);
}

server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  if (!REDIS_URL) {
    console.log(`Dev publish endpoint: POST http://localhost:${PORT}/dev/publish`);
  }
});

// Separate health server on different port if specified
if (HEALTH_PORT !== PORT) {
  const healthServer = createServer((req, res) => {
    if (req.url === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", connections: wss.clients.size }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  healthServer.listen(HEALTH_PORT, () => {
    console.log(`Health check on http://localhost:${HEALTH_PORT}/health`);
  });
}
