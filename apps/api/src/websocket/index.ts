/**
 * WebSocket module exports
 * Real-time updates for Linear clone application
 */

// Core WebSocket manager
export { wsManager } from './manager';
export type { WebSocketManager } from './manager';

// Hono integration handlers
export {
  handleWebSocketUpgrade,
  handleWebSocketMessage,
  handleWebSocketClose,
  handleWebSocketError,
  getWebSocketStats,
} from './handler';

// Broadcast helpers for service layer
export {
  broadcastIssueCreated,
  broadcastIssueUpdated,
  broadcastIssueDeleted,
  broadcastIssueArchived,
  broadcastCommentCreated,
  broadcastCommentUpdated,
  broadcastCommentDeleted,
  broadcastProjectUpdated,
  broadcastCycleUpdated,
  broadcastUserTyping,
  sendUserNotification,
} from './broadcast';

// Rate limiting
export { wsRateLimiter, authRateLimiter, RateLimiter } from './rateLimit';

// Types
export type {
  WebSocketEventType,
  WebSocketMessage,
  IssueCreatedPayload,
  IssueUpdatedPayload,
  IssueDeletedPayload,
  CommentCreatedPayload,
  CommentUpdatedPayload,
  UserTypingPayload,
  ConnectionAckPayload,
  ErrorPayload,
  SubscriptionMessage,
  WSClient,
  WSState,
} from './types';

export { RoomNames } from './types';
