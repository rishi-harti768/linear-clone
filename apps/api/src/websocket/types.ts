import type { WebSocket } from 'ws';

/**
 * WebSocket Event Types
 * All real-time events that can be broadcast to clients
 */
export type WebSocketEventType =
  | 'issue.created'
  | 'issue.updated'
  | 'issue.deleted'
  | 'issue.archived'
  | 'comment.created'
  | 'comment.updated'
  | 'comment.deleted'
  | 'project.updated'
  | 'cycle.updated'
  | 'user.typing'
  | 'connection.ack'
  | 'error';

/**
 * Base WebSocket message structure
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  timestamp: string;
  userId?: string;
}

/**
 * Issue-related event payloads
 */
export interface IssueCreatedPayload {
  issue: {
    id: string;
    teamId: string;
    identifier: string;
    title: string;
    status: string;
    priority: string;
    assigneeId?: string | null;
  };
}

export interface IssueUpdatedPayload {
  id: string;
  teamId: string;
  changes: Record<string, unknown>;
  userId: string;
}

export interface IssueDeletedPayload {
  id: string;
  teamId: string;
  userId: string;
}

/**
 * Comment-related event payloads
 */
export interface CommentCreatedPayload {
  comment: {
    id: string;
    issueId: string;
    userId: string;
    body: string;
    createdAt: string;
  };
  issueId: string;
  teamId: string;
}

export interface CommentUpdatedPayload {
  id: string;
  issueId: string;
  teamId: string;
  changes: Record<string, unknown>;
}

/**
 * Typing indicator payload
 */
export interface UserTypingPayload {
  userId: string;
  userName: string;
  entityType: 'issue' | 'comment';
  entityId: string;
  isTyping: boolean;
}

/**
 * Connection acknowledgment payload
 */
export interface ConnectionAckPayload {
  message: string;
  userId: string;
  timestamp: string;
}

/**
 * Error payload
 */
export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Client subscription message
 */
export interface SubscriptionMessage {
  action: 'subscribe' | 'unsubscribe';
  rooms: string[];
}

/**
 * WebSocket client connection info
 */
export interface WSClient {
  ws: WebSocket;
  userId: string;
  userEmail: string;
  rooms: Set<string>;
  lastPing: Date;
}

/**
 * Room name helpers
 */
export const RoomNames = {
  workspace: (workspaceId: string) => `workspace:${workspaceId}`,
  team: (teamId: string) => `team:${teamId}`,
  issue: (issueId: string) => `issue:${issueId}`,
  project: (projectId: string) => `project:${projectId}`,
  cycle: (cycleId: string) => `cycle:${cycleId}`,
  user: (userId: string) => `user:${userId}`,
} as const;

/**
 * WebSocket connection state
 */
export enum WSState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}
