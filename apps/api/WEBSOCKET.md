# WebSocket Real-time Updates System

## Overview

Complete WebSocket implementation for real-time collaboration in the Linear clone application. Provides room-based pub/sub system with JWT authentication, rate limiting, and automatic heartbeat/reconnection.

## Architecture

```
websocket/
├── types.ts         # Event types, payloads, and interfaces
├── manager.ts       # Connection and room management (singleton)
├── handler.ts       # Hono integration with JWT authentication
├── rateLimit.ts     # Rate limiting for WebSocket messages
├── broadcast.ts     # Helper functions for service layer integration
└── index.ts         # Public API exports
```

## Features

✅ **JWT Authentication** - Secure WebSocket connections with JWT tokens
✅ **Room-based Pub/Sub** - Subscribe to workspace, team, issue, project, cycle rooms
✅ **Rate Limiting** - 100 messages/minute per client (configurable)
✅ **Heartbeat/Ping** - Automatic connection health checks (30s ping, 60s timeout)
✅ **Graceful Shutdown** - Proper cleanup on server shutdown
✅ **Type Safety** - Full TypeScript support with discriminated unions
✅ **Broadcasting Helpers** - Easy integration with service layer

## Connection Protocol

### WebSocket Endpoint

```
ws://localhost:3001/ws
```

### Authentication

Provide JWT token via query parameter or Authorization header:

**Option 1: Query Parameter**
```
ws://localhost:3001/ws?token=<your-jwt-token>
```

**Option 2: Authorization Header** (recommended)
```javascript
const ws = new WebSocket('ws://localhost:3001/ws', {
  headers: {
    Authorization: 'Bearer <your-jwt-token>'
  }
});
```

### Connection Acknowledgement

On successful connection, server sends:

```json
{
  "type": "connection.ack",
  "payload": {
    "message": "Connected to WebSocket server",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Message Protocol

### Client → Server Messages

#### Ping (Heartbeat)

```json
{
  "type": "ping"
}
```

Response:
```json
{
  "type": "connection.ack",
  "payload": {
    "message": "pong",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Subscribe to Rooms

```json
{
  "action": "subscribe",
  "rooms": [
    "workspace:ws_123",
    "team:team_456",
    "issue:issue_789"
  ]
}
```

#### Unsubscribe from Rooms

```json
{
  "action": "unsubscribe",
  "rooms": ["issue:issue_789"]
}
```

### Server → Client Events

All server events follow this format:

```typescript
{
  type: WebSocketEventType;
  payload: EventPayload;
  timestamp: string; // ISO 8601
  userId?: string;   // User who triggered the event
}
```

#### Event Types

**Issue Events:**
- `issue.created` - New issue created
- `issue.updated` - Issue properties changed
- `issue.deleted` - Issue deleted
- `issue.archived` - Issue archived

**Comment Events:**
- `comment.created` - New comment added
- `comment.updated` - Comment edited
- `comment.deleted` - Comment deleted

**Project Events:**
- `project.updated` - Project properties changed

**Cycle Events:**
- `cycle.updated` - Cycle properties changed

**User Events:**
- `user.typing` - User typing indicator (ephemeral)

**System Events:**
- `connection.ack` - Connection acknowledgement or pong response
- `error` - Error message

### Event Payloads

#### issue.created

```json
{
  "type": "issue.created",
  "payload": {
    "id": "issue_123",
    "identifier": "ENG-42",
    "title": "Fix login bug",
    "teamId": "team_456",
    "status": "todo",
    "priority": "high"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userId": "user_789"
}
```

#### issue.updated

```json
{
  "type": "issue.updated",
  "payload": {
    "id": "issue_123",
    "changes": {
      "status": "in_progress",
      "assigneeId": "user_999"
    },
    "teamId": "team_456"
  },
  "timestamp": "2024-01-15T10:31:00.000Z",
  "userId": "user_789"
}
```

#### comment.created

```json
{
  "type": "comment.created",
  "payload": {
    "id": "comment_123",
    "issueId": "issue_456",
    "teamId": "team_789",
    "userId": "user_999",
    "body": "Fixed in latest commit"
  },
  "timestamp": "2024-01-15T10:32:00.000Z"
}
```

#### user.typing

```json
{
  "type": "user.typing",
  "payload": {
    "issueId": "issue_123",
    "userId": "user_789",
    "userEmail": "john@example.com",
    "isTyping": true
  },
  "timestamp": "2024-01-15T10:33:00.000Z"
}
```

#### error

```json
{
  "type": "error",
  "payload": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 42 seconds."
  },
  "timestamp": "2024-01-15T10:34:00.000Z"
}
```

## Room Naming Conventions

Use the `RoomNames` helper to generate room identifiers:

```typescript
import { RoomNames } from './websocket';

// Workspace room (all updates for workspace)
const workspaceRoom = RoomNames.workspace('workspace_123');
// → "workspace:workspace_123"

// Team room (all team updates and issues)
const teamRoom = RoomNames.team('team_456');
// → "team:team_456"

// Issue room (specific issue updates and comments)
const issueRoom = RoomNames.issue('issue_789');
// → "issue:issue_789"

// Project room (project-specific updates)
const projectRoom = RoomNames.project('project_abc');
// → "project:project_abc"

// Cycle room (cycle-specific updates)
const cycleRoom = RoomNames.cycle('cycle_def');
// → "cycle:cycle_def"

// User room (notifications for specific user)
const userRoom = RoomNames.user('user_123');
// → "user:user_123"
```

## Service Layer Integration

### Broadcasting Events from Services

Use the helper functions from `broadcast.ts`:

```typescript
import { 
  broadcastIssueCreated, 
  broadcastIssueUpdated,
  broadcastCommentCreated 
} from './websocket';

// In issue.service.ts
export async function createIssue(data: CreateIssueInput, userId: string) {
  // Create issue in database
  const issue = await db.insert(issues).values(data).returning();
  
  // Broadcast to all team members
  broadcastIssueCreated(issue.teamId, {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    teamId: issue.teamId,
    status: issue.status,
    priority: issue.priority,
  });
  
  return issue;
}

// In comment.service.ts
export async function createComment(data: CreateCommentInput) {
  const comment = await db.insert(comments).values(data).returning();
  
  broadcastCommentCreated({
    id: comment.id,
    issueId: comment.issueId,
    teamId: data.teamId, // Pass from issue lookup
    userId: comment.userId,
    body: comment.body,
  });
  
  return comment;
}
```

### Available Broadcast Helpers

```typescript
// Issue events
broadcastIssueCreated(teamId, payload);
broadcastIssueUpdated(teamId, payload, userId);
broadcastIssueDeleted(teamId, payload, userId);
broadcastIssueArchived(teamId, payload, userId);

// Comment events
broadcastCommentCreated(payload);
broadcastCommentUpdated(payload, userId);
broadcastCommentDeleted(issueId, teamId, commentId, userId);

// Project events
broadcastProjectUpdated(teamId, projectId, changes, userId);

// Cycle events
broadcastCycleUpdated(teamId, cycleId, changes, userId);

// Typing indicator
broadcastUserTyping(issueId, payload);

// User notifications
sendUserNotification(userId, payload);
```

### Direct Access to WebSocket Manager

For advanced use cases, use the `wsManager` singleton:

```typescript
import { wsManager, RoomNames } from './websocket';

// Send custom event to a room
wsManager.broadcastToRoom(RoomNames.team('team_123'), {
  type: 'custom.event',
  payload: { data: 'custom data' },
  timestamp: new Date().toISOString(),
});

// Send to specific user (all their connections)
wsManager.sendToUser('user_456', {
  type: 'notification.new',
  payload: { message: 'You have a new notification' },
  timestamp: new Date().toISOString(),
});

// Get connection statistics
const stats = wsManager.getStats();
console.log(stats);
// {
//   totalClients: 42,
//   totalRooms: 15,
//   clientsPerRoom: { 'team:team_123': 5, ... }
// }
```

## Rate Limiting

### Default Limits

- **Message Rate**: 100 messages per minute per client
- **Auth Rate**: 10 authentication attempts per minute per IP

### Custom Rate Limiter

```typescript
import { RateLimiter } from './websocket';

// Create custom rate limiter (50 messages per 30 seconds)
const customLimiter = new RateLimiter(50, 30000);

// Check rate limit
if (customLimiter.isRateLimited(clientId)) {
  const remaining = customLimiter.getRemaining(clientId);
  const resetTime = customLimiter.getResetTime(clientId);
  console.log(`Rate limited. ${remaining} remaining, resets in ${resetTime}ms`);
}

// Reset rate limit (admin override)
customLimiter.reset(clientId);

// Get statistics
const stats = customLimiter.getStats();
console.log(stats);
// { totalClients: 10, averageUsage: 42.5 }

// Cleanup on shutdown
customLimiter.shutdown();
```

## Client Example (TypeScript)

```typescript
class LinearWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  
  constructor(private token: string) {}
  
  connect(): void {
    this.ws = new WebSocket(`ws://localhost:3001/ws?token=${this.token}`);
    
    this.ws.on('open', () => {
      console.log('✅ Connected to WebSocket server');
      
      // Subscribe to rooms
      this.subscribe(['workspace:ws_123', 'team:team_456']);
    });
    
    this.ws.on('message', (data: Buffer) => {
      const message = JSON.parse(data.toString());
      this.handleMessage(message);
    });
    
    this.ws.on('close', (code, reason) => {
      console.log(`❌ Connection closed: ${code} - ${reason}`);
      this.reconnect();
    });
    
    this.ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
    
    // Send ping every 25 seconds
    setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
  }
  
  subscribe(rooms: string[]): void {
    this.ws?.send(JSON.stringify({
      action: 'subscribe',
      rooms,
    }));
  }
  
  unsubscribe(rooms: string[]): void {
    this.ws?.send(JSON.stringify({
      action: 'unsubscribe',
      rooms,
    }));
  }
  
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'connection.ack':
        console.log('✅ Connection acknowledged');
        break;
      
      case 'issue.created':
        console.log('🆕 New issue:', message.payload);
        break;
      
      case 'issue.updated':
        console.log('✏️ Issue updated:', message.payload);
        break;
      
      case 'comment.created':
        console.log('💬 New comment:', message.payload);
        break;
      
      case 'error':
        console.error('❌ Error:', message.payload);
        break;
      
      default:
        console.log('📨 Unknown message:', message);
    }
  }
  
  private reconnect(): void {
    console.log('🔄 Reconnecting in 5 seconds...');
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }
  
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
  }
}

// Usage
const client = new LinearWebSocketClient('your-jwt-token');
client.connect();
```

## Frontend Integration (React)

```typescript
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIssueStore } from '@/stores/issueStore';

export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const token = useAuthStore((state) => state.token);
  const updateIssue = useIssueStore((state) => state.updateIssue);
  const addComment = useIssueStore((state) => state.addComment);
  
  useEffect(() => {
    if (!token) return;
    
    const socket = new WebSocket(`ws://localhost:3001/ws?token=${token}`);
    
    socket.onopen = () => {
      console.log('✅ WebSocket connected');
      setConnected(true);
      
      // Subscribe to workspace and team rooms
      socket.send(JSON.stringify({
        action: 'subscribe',
        rooms: ['workspace:ws_123', 'team:team_456'],
      }));
    };
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'issue.updated':
          // Optimistic update reconciliation
          updateIssue(message.payload.id, message.payload.changes);
          break;
        
        case 'comment.created':
          // Add new comment to issue
          addComment(message.payload.issueId, message.payload);
          break;
        
        // ... other cases
      }
    };
    
    socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    };
    
    setWs(socket);
    
    return () => {
      socket.close();
    };
  }, [token]);
  
  return { ws, connected };
}
```

## Monitoring & Statistics

### WebSocket Stats Endpoint

```bash
curl http://localhost:3001/api/v1/ws/stats
```

Response:
```json
{
  "data": {
    "stats": {
      "totalClients": 42,
      "totalRooms": 15,
      "clientsPerRoom": {
        "workspace:ws_123": 10,
        "team:team_456": 8,
        "issue:issue_789": 3
      }
    },
    "timestamp": "2024-01-15T10:35:00.000Z"
  }
}
```

### Rate Limiter Stats

```typescript
import { wsRateLimiter } from './websocket';

const stats = wsRateLimiter.getStats();
console.log(stats);
// { totalClients: 42, averageUsage: 23.5 }
```

## Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `UNAUTHORIZED` | Invalid or missing JWT token | Reconnect with valid token |
| `RATE_LIMIT_EXCEEDED` | Too many messages sent | Wait for rate limit reset |
| `INVALID_MESSAGE` | Malformed JSON or unknown message type | Check message format |
| `UNKNOWN_ERROR` | Internal server error | Retry with exponential backoff |

## Production Considerations

### Environment Variables

```bash
# .env
PORT=3001
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=production
```

### Scaling

For horizontal scaling across multiple servers, consider:

1. **Redis Pub/Sub** - Replace in-memory rooms with Redis
2. **Sticky Sessions** - Route clients to same server (load balancer)
3. **Shared State** - Use Redis for client metadata

### Security

✅ JWT authentication required for all connections
✅ Rate limiting prevents abuse (100 msg/min per client)
✅ Automatic connection cleanup on auth failure
✅ CORS configuration for frontend origin
✅ Heartbeat mechanism detects dead connections

### Performance

- **Connection pooling**: Reuse TCP connections
- **Message batching**: Batch broadcasts for multiple clients in same room
- **Lazy room creation**: Rooms created only when first client subscribes
- **Automatic cleanup**: Remove empty rooms and dead connections

### Monitoring

Track these metrics in production:

- Active connections count
- Messages per second
- Average message size
- Rate limit violations
- Connection errors
- Heartbeat failures

## Testing

### Unit Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { WebSocketManager } from './manager';

describe('WebSocketManager', () => {
  let manager: WebSocketManager;
  
  beforeEach(() => {
    manager = new WebSocketManager();
  });
  
  it('should subscribe client to room', () => {
    const mockWs = {} as WebSocket;
    const clientId = 'test_client';
    
    manager.addClient(clientId, mockWs, 'user_123', 'test@example.com');
    manager.subscribe(clientId, ['team:team_123']);
    
    const stats = manager.getStats();
    expect(stats.totalClients).toBe(1);
    expect(stats.clientsPerRoom['team:team_123']).toBe(1);
  });
});
```

### Integration Tests

```typescript
import { describe, it, expect } from 'vitest';
import WebSocket from 'ws';

describe('WebSocket Integration', () => {
  it('should authenticate and subscribe to rooms', async () => {
    const ws = new WebSocket('ws://localhost:3001/ws?token=valid-token');
    
    await new Promise((resolve) => ws.on('open', resolve));
    
    ws.send(JSON.stringify({
      action: 'subscribe',
      rooms: ['team:team_123'],
    }));
    
    const message = await new Promise((resolve) => {
      ws.on('message', (data) => {
        resolve(JSON.parse(data.toString()));
      });
    });
    
    expect(message.type).toBe('connection.ack');
  });
});
```

## Troubleshooting

### Connection Refused

- Check server is running: `npm run dev`
- Verify port 3001 is not in use
- Check firewall settings

### Authentication Failed

- Verify JWT token is valid and not expired
- Check `JWT_SECRET` environment variable matches
- Ensure token is sent in query param or Authorization header

### Messages Not Received

- Verify client is subscribed to correct room
- Check room naming convention (use `RoomNames` helpers)
- Verify server is broadcasting to correct rooms

### Rate Limit Exceeded

- Reduce message frequency
- Wait for rate limit reset (check error message for time)
- Contact admin for rate limit increase if needed

---

**Phase 3.4 Complete** ✅ WebSocket real-time updates fully implemented!
