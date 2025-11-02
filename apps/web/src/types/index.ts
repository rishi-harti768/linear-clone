/**
 * Core type definitions for the Linear clone
 * These mirror the database schema but are frontend-specific
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceMemberRole = 'owner' | 'admin' | 'member' | 'guest';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  createdAt: Date;
  user?: User;
}

export interface Team {
  id: string;
  workspaceId: string;
  name: string;
  identifier: string;
  description: string | null;
  icon: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  createdAt: Date;
  user?: User;
}

export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  teamId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  targetDate: Date | null;
  leadId: string | null;
  color: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lead?: User;
}

export interface Cycle {
  id: string;
  teamId: string;
  name: string;
  number: number;
  startDate: Date;
  endDate: Date;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';
export type IssuePriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export interface Issue {
  id: string;
  teamId: string;
  projectId: string | null;
  cycleId: string | null;
  identifier: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  creatorId: string;
  parentId: string | null;
  dueDate: Date | null;
  estimate: number | null;
  sortOrder: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  assignee?: User;
  creator?: User;
  project?: Project;
  cycle?: Cycle;
  labels?: Label[];
}

export interface Label {
  id: string;
  teamId: string;
  name: string;
  color: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueLabel {
  id: string;
  issueId: string;
  labelId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  parentId: string | null;
  body: string;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  reactions?: CommentReaction[];
}

export interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
  user?: User;
}

export interface Attachment {
  id: string;
  issueId: string | null;
  commentId: string | null;
  userId: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  user?: User;
}

export type NotificationType = 'mention' | 'assignment' | 'comment' | 'status_change';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  entityType: string;
  entityId: string;
  read: boolean;
  archived: boolean;
  createdAt: Date;
}

/**
 * Filter types for issue queries
 */
export interface IssueFilters {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  assigneeId?: string[];
  labelId?: string[];
  projectId?: string | null;
  cycleId?: string | null;
  search?: string;
}

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}
