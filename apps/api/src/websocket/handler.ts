import type { Context } from 'hono';
import type { WebSocket } from 'ws';
import { verifyToken } from '../lib/auth';
import { wsManager } from './manager';
import { wsRateLimiter } from './rateLimit';
import type { SubscriptionMessage, WebSocketMessage } from './types';

/**
 * Handle WebSocket upgrade request
 * @param c - Hono context
 * @param ws - WebSocket instance
 */
export function handleWebSocketUpgrade(c: Context, ws: WebSocket, clientId: string): void {
  try {
    // Extract token from query params or authorization header
    const token = c.req.query('token') || c.req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.error('[WS] No authentication token provided');
      ws.close(1008, 'Authentication required');
      return;
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId || !decoded.email) {
      console.error('[WS] Invalid token');
      ws.close(1008, 'Invalid authentication token');
      return;
    }

    // Register client with manager
    wsManager.addClient(clientId, ws, decoded.userId, decoded.email);

    // Setup event handlers
    ws.on('message', (data: Buffer) => {
      handleWebSocketMessage(clientId, data);
    });

    ws.on('pong', () => {
      wsManager.updatePing(clientId);
    });

    ws.on('close', () => {
      handleWebSocketClose(clientId);
    });

    ws.on('error', (error) => {
      handleWebSocketError(clientId, error);
    });
  } catch (error) {
    console.error('[WS] Error handling upgrade:', error);
    ws.close(1011, 'Internal server error');
  }
}

/**
 * Handle incoming WebSocket messages
 */
export function handleWebSocketMessage(clientId: string, data: Buffer): void {
  // Rate limiting check
  if (wsRateLimiter.isRateLimited(clientId)) {
    const resetTime = wsRateLimiter.getResetTime(clientId);
    wsManager.sendToClient(clientId, {
      type: 'error',
      payload: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)} seconds.`,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const message = JSON.parse(data.toString()) as
      | SubscriptionMessage
      | { type: 'ping' }
      | WebSocketMessage;

    // Handle ping messages
    if ('type' in message && message.type === 'ping') {
      wsManager.updatePing(clientId);
      wsManager.sendToClient(clientId, {
        type: 'connection.ack',
        payload: { message: 'pong', timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Handle subscription messages
    if (
      'action' in message &&
      (message.action === 'subscribe' || message.action === 'unsubscribe')
    ) {
      wsManager.handleSubscription(clientId, message as SubscriptionMessage);
      return;
    }

    // Log unknown message types
    console.log(`[WS] Received message from ${clientId}:`, message);
  } catch (error) {
    console.error(`[WS] Error parsing message from ${clientId}:`, error);
    wsManager.sendToClient(clientId, {
      type: 'error',
      payload: {
        code: 'INVALID_MESSAGE',
        message: 'Invalid message format',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Handle WebSocket close event
 */
export function handleWebSocketClose(clientId: string): void {
  console.log(`[WS] Connection closed: ${clientId}`);
  wsManager.removeClient(clientId);
}

/**
 * Handle WebSocket error event
 */
export function handleWebSocketError(clientId: string, error: Error): void {
  console.error(`[WS] Error for client ${clientId}:`, error);
  wsManager.removeClient(clientId);
}

/**
 * Get WebSocket stats endpoint handler
 */
export function getWebSocketStats(c: Context) {
  const stats = wsManager.getStats();
  return c.json({
    data: {
      stats,
      timestamp: new Date().toISOString(),
    },
  });
}
