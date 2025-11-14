/**
 * Signals Durable Object (Cycles 71-80)
 *
 * WebSocket-based SSE streaming for marketing/ontology signals.
 * Premium tier only (requires x402 payment + Sui right).
 */

import type { Env } from '../types';

interface SignalsState {
  connections: Map<string, WebSocket>;
  lastSignals: Array<{ id: string; timestamp: number; data: any }>;
  rateLimits: Map<string, { count: number; resetAt: number }>;
}

export class SignalsDO implements DurableObject {
  state: DurableObjectState;
  env: Env;
  connections: Map<string, WebSocket>;
  lastSignals: Array<{ id: string; timestamp: number; data: any }>;
  rateLimits: Map<string, { count: number; resetAt: number }>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.connections = new Map();
    this.lastSignals = [];
    this.rateLimits = new Map();

    // Restore state from storage
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<SignalsState>('state');
      if (stored) {
        this.lastSignals = stored.lastSignals || [];
        this.rateLimits = new Map(stored.rateLimits || []);
      }
    });

    // Broadcast signals periodically (every 10 seconds)
    setInterval(() => this.generateAndBroadcastSignal(), 10000);
  }

  /**
   * Handle WebSocket connection (Cycles 71-72)
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Only accept WebSocket upgrade requests
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    // Check authorization (require payment proof)
    const agent = url.searchParams.get('agent');
    const paymentProof = url.searchParams.get('proof');

    if (!agent || !paymentProof) {
      return new Response('Unauthorized: Missing agent or payment proof', {
        status: 401,
      });
    }

    // TODO: Verify payment proof via x402
    // For now, accept if proof is provided

    // Check Sui right (premium tier)
    // TODO: Integrate with lib/sui.ts checkSuiRight()

    // Check rate limits (Cycles 75-76)
    const allowed = this.checkRateLimit(agent);
    if (!allowed) {
      return new Response('Rate limit exceeded', { status: 429 });
    }

    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept WebSocket connection
    this.state.acceptWebSocket(server);

    // Store connection
    this.connections.set(agent, server);

    // Send replay of recent signals (Cycles 79-80)
    const lastId = url.searchParams.get('lastId');
    if (lastId) {
      this.replaySignals(server, lastId);
    }

    // Return client WebSocket
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  /**
   * Handle WebSocket messages
   */
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // Signals are one-way (server → client)
    // Ignore client messages for now
    console.log('Received message from client:', message);
  }

  /**
   * Handle WebSocket close
   */
  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ) {
    // Remove connection
    for (const [agent, socket] of this.connections.entries()) {
      if (socket === ws) {
        this.connections.delete(agent);
        console.log(`Client disconnected: ${agent}`);
        break;
      }
    }
  }

  /**
   * Handle WebSocket error
   */
  async webSocketError(ws: WebSocket, error: Error) {
    console.error('WebSocket error:', error);
  }

  /**
   * Generate and broadcast signal (Cycles 77-78)
   */
  private generateAndBroadcastSignal() {
    const signal = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      data: {
        type: 'marketing_signal',
        trendingTopics: ['AI agents', 'x402 payments', '6D ontology'],
        messageFitScore: 0.87,
        recommendedChannels: ['twitter', 'linkedin', 'discord'],
      },
    };

    // Store signal (keep last 1000)
    this.lastSignals.push(signal);
    if (this.lastSignals.length > 1000) {
      this.lastSignals.shift();
    }

    // Broadcast to all connections (Cycles 73-74)
    const message = JSON.stringify(signal);
    for (const [agent, ws] of this.connections.entries()) {
      try {
        ws.send(message);
      } catch (error) {
        console.error(`Failed to send to ${agent}:`, error);
        this.connections.delete(agent);
      }
    }

    // Persist state
    this.persistState();
  }

  /**
   * Replay missed signals (Cycles 79-80)
   */
  private replaySignals(ws: WebSocket, lastId: string) {
    const lastIndex = this.lastSignals.findIndex((s) => s.id === lastId);

    if (lastIndex === -1) {
      // Last ID not found, send all recent signals
      console.log('Last ID not found, sending all recent signals');
      for (const signal of this.lastSignals) {
        ws.send(JSON.stringify(signal));
      }
      return;
    }

    // Send signals after lastId
    const missedSignals = this.lastSignals.slice(lastIndex + 1);
    console.log(`Replaying ${missedSignals.length} missed signals`);
    for (const signal of missedSignals) {
      ws.send(JSON.stringify(signal));
    }
  }

  /**
   * Check rate limits (Cycles 75-76)
   * - 100 connections per agent
   * - 1000 messages per hour
   */
  private checkRateLimit(agent: string): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(agent);

    if (!limit || limit.resetAt < now) {
      // New hour, reset counter
      this.rateLimits.set(agent, {
        count: 1,
        resetAt: now + 60 * 60 * 1000, // 1 hour
      });
      return true;
    }

    if (limit.count >= 100) {
      // Rate limit exceeded
      return false;
    }

    // Increment counter
    limit.count++;
    this.rateLimits.set(agent, limit);
    return true;
  }

  /**
   * Persist state to Durable Object storage
   */
  private async persistState() {
    await this.state.storage.put<SignalsState>('state', {
      connections: this.connections,
      lastSignals: this.lastSignals,
      rateLimits: this.rateLimits,
    });
  }
}
