import { wsManager } from './manager';
import type {
  CommentCreatedPayload,
  CommentUpdatedPayload,
  IssueCreatedPayload,
  IssueDeletedPayload,
  IssueUpdatedPayload,
  UserTypingPayload,
} from './types';

/**
 * Broadcast helpers for service layer integration
 * These functions make it easy to broadcast events from service methods
 */

/**
 * Broadcast issue created event
 */
export function broadcastIssueCreated(teamId: string, payload: IssueCreatedPayload): void {
  wsManager.broadcast.issueEvent(teamId, 'issue.created', payload);
}

/**
 * Broadcast issue updated event
 */
export function broadcastIssueUpdated(
  teamId: string,
  payload: IssueUpdatedPayload,
  userId: string
): void {
  wsManager.broadcast.issueEvent(teamId, 'issue.updated', payload, userId);

  // Also broadcast to the specific issue room for real-time detail view updates
  wsManager.broadcast.toIssue(payload.id, 'issue.updated', payload, userId);
}

/**
 * Broadcast issue deleted event
 */
export function broadcastIssueDeleted(
  teamId: string,
  payload: IssueDeletedPayload,
  userId: string
): void {
  wsManager.broadcast.issueEvent(teamId, 'issue.deleted', payload, userId);
  wsManager.broadcast.toIssue(payload.id, 'issue.deleted', payload, userId);
}

/**
 * Broadcast issue archived event
 */
export function broadcastIssueArchived(
  teamId: string,
  payload: IssueDeletedPayload,
  userId: string
): void {
  wsManager.broadcast.issueEvent(teamId, 'issue.archived', payload, userId);
  wsManager.broadcast.toIssue(payload.id, 'issue.archived', payload, userId);
}

/**
 * Broadcast comment created event
 */
export function broadcastCommentCreated(payload: CommentCreatedPayload): void {
  wsManager.broadcast.issueEvent(payload.teamId, 'comment.created', payload);
  wsManager.broadcast.toIssue(payload.issueId, 'comment.created', payload);
}

/**
 * Broadcast comment updated event
 */
export function broadcastCommentUpdated(payload: CommentUpdatedPayload, userId: string): void {
  wsManager.broadcast.issueEvent(payload.teamId, 'comment.updated', payload, userId);
  wsManager.broadcast.toIssue(payload.issueId, 'comment.updated', payload, userId);
}

/**
 * Broadcast comment deleted event
 */
export function broadcastCommentDeleted(
  issueId: string,
  teamId: string,
  commentId: string,
  userId: string
): void {
  const payload = { id: commentId, issueId, teamId };
  wsManager.broadcast.issueEvent(teamId, 'comment.deleted', payload, userId);
  wsManager.broadcast.toIssue(issueId, 'comment.deleted', payload, userId);
}

/**
 * Broadcast project updated event
 */
export function broadcastProjectUpdated(
  teamId: string,
  projectId: string,
  changes: Record<string, unknown>,
  userId: string
): void {
  wsManager.broadcast.issueEvent(
    teamId,
    'project.updated',
    { id: projectId, changes, teamId },
    userId
  );
}

/**
 * Broadcast cycle updated event
 */
export function broadcastCycleUpdated(
  teamId: string,
  cycleId: string,
  changes: Record<string, unknown>,
  userId: string
): void {
  wsManager.broadcast.issueEvent(teamId, 'cycle.updated', { id: cycleId, changes, teamId }, userId);
}

/**
 * Broadcast user typing indicator
 */
export function broadcastUserTyping(issueId: string, payload: UserTypingPayload): void {
  wsManager.broadcast.toIssue(issueId, 'user.typing', payload);
}

/**
 * Send notification to specific user
 */
export function sendUserNotification<T>(userId: string, payload: T): void {
  wsManager.sendToUser(userId, {
    type: 'issue.updated', // Generic type, can be customized
    payload,
    timestamp: new Date().toISOString(),
  });
}
