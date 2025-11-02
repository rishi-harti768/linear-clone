import type { WebSocket } from 'ws';
import type { SubscriptionMessage, WSClient, WebSocketEventType, WebSocketMessage } from './types';

/**
 * WebSocket Manager
 * Handles client connections, room subscriptions, and message broadcasting
 */
export class WebSocketManager {
  private clients: Map<string, WSClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map(); // roomName -> Set<clientId>
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Register a new WebSocket client
   */
  addClient(clientId: string, ws: WebSocket, userId: string, userEmail: string): void {
    const client: WSClient = {
      ws,
      userId,
      userEmail,
      rooms: new Set(),
      lastPing: new Date(),
    };

    this.clients.set(clientId, client);
    console.log(`[WS] Client connected: ${clientId} (user: ${userId})`);

    // Send connection acknowledgment
    this.sendToClient(clientId, {
      type: 'connection.ack',
      payload: {
        message: 'Connected successfully',
        userId,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Remove a WebSocket client
   */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Unsubscribe from all rooms
    for (const room of client.rooms) {
      this.unsubscribeFromRoom(clientId, room);
    }

    this.clients.delete(clientId);
    console.log(`[WS] Client disconnected: ${clientId}`);
  }

  /**
   * Subscribe client to rooms
   */
  subscribe(clientId: string, roomNames: string[]): void {
    const client = this.clients.get(clientId);
    if (!client) {
      console.error(`[WS] Client not found: ${clientId}`);
      return;
    }

    for (const roomName of roomNames) {
      // Add room to client's subscriptions
      client.rooms.add(roomName);

      // Add client to room
      if (!this.rooms.has(roomName)) {
        this.rooms.set(roomName, new Set());
      }
      this.rooms.get(roomName)?.add(clientId);

      console.log(`[WS] Client ${clientId} subscribed to room: ${roomName}`);
    }
  }

  /**
   * Unsubscribe client from rooms
   */
  unsubscribe(clientId: string, roomNames: string[]): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    for (const roomName of roomNames) {
      this.unsubscribeFromRoom(clientId, roomName);
    }
  }

  /**
   * Unsubscribe from a single room
   */
  private unsubscribeFromRoom(clientId: string, roomName: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.rooms.delete(roomName);

    const room = this.rooms.get(roomName);
    if (room) {
      room.delete(clientId);
      if (room.size === 0) {
        this.rooms.delete(roomName);
      }
    }

    console.log(`[WS] Client ${clientId} unsubscribed from room: ${roomName}`);
  }

  /**
   * Broadcast message to a specific room
   */
  broadcastToRoom<T>(roomName: string, message: WebSocketMessage<T>): void {
    const room = this.rooms.get(roomName);
    if (!room || room.size === 0) {
      console.log(`[WS] No clients in room: ${roomName}`);
      return;
    }

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const clientId of room) {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === 1) {
        // 1 = OPEN
        try {
          client.ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`[WS] Failed to send to client ${clientId}:`, error);
        }
      }
    }

    console.log(
      `[WS] Broadcast to room ${roomName}: ${message.type} (${sentCount}/${room.size} clients)`
    );
  }

  /**
   * Broadcast message to multiple rooms
   */
  broadcastToRooms<T>(roomNames: string[], message: WebSocketMessage<T>): void {
    for (const roomName of roomNames) {
      this.broadcastToRoom(roomName, message);
    }
  }

  /**
   * Send message to a specific client
   */
  sendToClient<T>(clientId: string, message: WebSocketMessage<T>): void {
    const client = this.clients.get(clientId);
    if (!client) {
      console.error(`[WS] Client not found: ${clientId}`);
      return;
    }

    if (client.ws.readyState !== 1) {
      // 1 = OPEN
      console.error(`[WS] Client ${clientId} connection not open`);
      return;
    }

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`[WS] Failed to send to client ${clientId}:`, error);
    }
  }

  /**
   * Send message to a specific user (all their connections)
   */
  sendToUser<T>(userId: string, message: WebSocketMessage<T>): void {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const [clientId, client] of this.clients) {
      if (client.userId === userId && client.ws.readyState === 1) {
        try {
          client.ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`[WS] Failed to send to client ${clientId}:`, error);
        }
      }
    }

    console.log(`[WS] Sent to user ${userId}: ${message.type} (${sentCount} connections)`);
  }

  /**
   * Handle subscription message from client
   */
  handleSubscription(clientId: string, message: SubscriptionMessage): void {
    if (message.action === 'subscribe') {
      this.subscribe(clientId, message.rooms);
    } else if (message.action === 'unsubscribe') {
      this.unsubscribe(clientId, message.rooms);
    }
  }

  /**
   * Update client's last ping time
   */
  updatePing(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastPing = new Date();
    }
  }

  /**
   * Start heartbeat to detect dead connections
   */
  public startHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      const now = new Date();
      const timeout = 60000; // 60 seconds

      for (const [clientId, client] of this.clients) {
        const timeSinceLastPing = now.getTime() - client.lastPing.getTime();

        if (timeSinceLastPing > timeout) {
          console.log(`[WS] Client ${clientId} timed out, closing connection`);
          client.ws.close();
          this.removeClient(clientId);
        } else if (client.ws.readyState === 1) {
          // Send ping
          try {
            client.ws.ping();
          } catch (error) {
            console.error(`[WS] Failed to ping client ${clientId}:`, error);
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Get stats about current connections
   */
  getStats(): {
    totalClients: number;
    totalRooms: number;
    clientsPerRoom: Record<string, number>;
  } {
    const clientsPerRoom: Record<string, number> = {};
    for (const [roomName, clients] of this.rooms) {
      clientsPerRoom[roomName] = clients.size;
    }

    return {
      totalClients: this.clients.size,
      totalRooms: this.rooms.size,
      clientsPerRoom,
    };
  }

  /**
   * Cleanup all connections
   */
  shutdown(): void {
    this.stopHeartbeat();

    for (const [clientId, client] of this.clients) {
      try {
        client.ws.close();
      } catch (error) {
        console.error(`[WS] Error closing client ${clientId}:`, error);
      }
    }

    this.clients.clear();
    this.rooms.clear();
    console.log('[WS] WebSocket manager shut down');
  }

  /**
   * Broadcast helper for common events
   */
  broadcast = {
    /**
     * Broadcast issue event to team room
     */
    issueEvent: <T>(
      teamId: string,
      type: WebSocketEventType,
      payload: T,
      userId?: string
    ): void => {
      this.broadcastToRoom(`team:${teamId}`, {
        type,
        payload,
        timestamp: new Date().toISOString(),
        userId,
      });
    },

    /**
     * Broadcast to specific issue room
     */
    toIssue: <T>(issueId: string, type: WebSocketEventType, payload: T, userId?: string): void => {
      this.broadcastToRoom(`issue:${issueId}`, {
        type,
        payload,
        timestamp: new Date().toISOString(),
        userId,
      });
    },

    /**
     * Broadcast to workspace room
     */
    toWorkspace: <T>(
      workspaceId: string,
      type: WebSocketEventType,
      payload: T,
      userId?: string
    ): void => {
      this.broadcastToRoom(`workspace:${workspaceId}`, {
        type,
        payload,
        timestamp: new Date().toISOString(),
        userId,
      });
    },
  };
}

// Singleton instance
export const wsManager = new WebSocketManager();
