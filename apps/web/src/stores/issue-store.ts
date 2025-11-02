import { create } from 'zustand';

export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';
export type IssuePriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export interface Issue {
  id: string;
  teamId: string;
  projectId?: string | null;
  cycleId?: string | null;
  identifier: string;
  title: string;
  description?: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId?: string | null;
  creatorId: string;
  parentId?: string | null;
  dueDate?: string | null;
  estimate?: number | null;
  sortOrder: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  labels?: { id: string; name: string; color: string }[];
}

export interface IssueFilters {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  assigneeId?: string[];
  labelId?: string[];
  projectId?: string;
  cycleId?: string;
  search?: string;
}

interface IssueState {
  issues: Issue[];
  activeIssue: Issue | null;
  filters: IssueFilters;
  isLoading: boolean;
  error: string | null;
}

interface IssueActions {
  setIssues: (issues: Issue[]) => void;
  setActiveIssue: (issue: Issue | null) => void;
  setFilters: (filters: IssueFilters) => void;
  fetchIssues: (teamId: string, token: string) => Promise<void>;
  fetchIssue: (issueId: string, token: string) => Promise<void>;
  createIssue: (teamId: string, data: Partial<Issue>, token: string) => Promise<Issue>;
  updateIssue: (issueId: string, data: Partial<Issue>, token: string) => Promise<void>;
  updateIssueOptimistic: (issueId: string, data: Partial<Issue>, token: string) => Promise<void>;
  deleteIssue: (issueId: string, token: string) => Promise<void>;
  archiveIssue: (issueId: string, token: string) => Promise<void>;
  clearError: () => void;
  clearFilters: () => void;
}

type IssueStore = IssueState & IssueActions;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useIssueStore = create<IssueStore>((set, get) => ({
  // Initial state
  issues: [],
  activeIssue: null,
  filters: {},
  isLoading: false,
  error: null,

  // Actions
  setIssues: (issues) => {
    set({ issues });
  },

  setActiveIssue: (issue) => {
    set({ activeIssue: issue });
  },

  setFilters: (filters) => {
    set({ filters });
  },

  fetchIssues: async (teamId: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const queryParams = new URLSearchParams();

      if (filters.status?.length) {
        queryParams.append('status', filters.status.join(','));
      }
      if (filters.priority?.length) {
        queryParams.append('priority', filters.priority.join(','));
      }
      if (filters.assigneeId?.length) {
        queryParams.append('assigneeId', filters.assigneeId.join(','));
      }
      if (filters.projectId) {
        queryParams.append('projectId', filters.projectId);
      }
      if (filters.cycleId) {
        queryParams.append('cycleId', filters.cycleId);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      const url = `${API_URL}/api/teams/${teamId}/issues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }

      const data = await response.json();
      set({
        issues: data.issues || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch issues',
        isLoading: false,
      });
    }
  },

  fetchIssue: async (issueId: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/issues/${issueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch issue');
      }

      const data = await response.json();
      set({
        activeIssue: data.issue,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch issue',
        isLoading: false,
      });
    }
  },

  createIssue: async (teamId: string, data: Partial<Issue>, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/teams/${teamId}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create issue');
      }

      const result = await response.json();
      const newIssue = result.issue;

      set((state) => ({
        issues: [newIssue, ...state.issues],
        isLoading: false,
      }));

      return newIssue;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create issue',
        isLoading: false,
      });
      throw error;
    }
  },

  updateIssue: async (issueId: string, data: Partial<Issue>, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update issue');
      }

      const result = await response.json();
      const updatedIssue = result.issue;

      set((state) => ({
        issues: state.issues.map((issue) => (issue.id === issueId ? updatedIssue : issue)),
        activeIssue: state.activeIssue?.id === issueId ? updatedIssue : state.activeIssue,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update issue',
        isLoading: false,
      });
      throw error;
    }
  },

  updateIssueOptimistic: async (issueId: string, data: Partial<Issue>, token: string) => {
    // Save previous state for rollback
    const previousIssues = get().issues;
    const previousActiveIssue = get().activeIssue;

    // Optimistic update
    set((state) => ({
      issues: state.issues.map((issue) => (issue.id === issueId ? { ...issue, ...data } : issue)),
      activeIssue:
        state.activeIssue?.id === issueId ? { ...state.activeIssue, ...data } : state.activeIssue,
    }));

    try {
      const response = await fetch(`${API_URL}/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update issue');
      }

      const result = await response.json();
      const updatedIssue = result.issue;

      // Update with server response
      set((state) => ({
        issues: state.issues.map((issue) => (issue.id === issueId ? updatedIssue : issue)),
        activeIssue: state.activeIssue?.id === issueId ? updatedIssue : state.activeIssue,
      }));
    } catch (error) {
      // Rollback on error
      set({
        issues: previousIssues,
        activeIssue: previousActiveIssue,
        error: error instanceof Error ? error.message : 'Failed to update issue',
      });
      throw error;
    }
  },

  deleteIssue: async (issueId: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/issues/${issueId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete issue');
      }

      set((state) => ({
        issues: state.issues.filter((issue) => issue.id !== issueId),
        activeIssue: state.activeIssue?.id === issueId ? null : state.activeIssue,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete issue',
        isLoading: false,
      });
      throw error;
    }
  },

  archiveIssue: async (issueId: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/issues/${issueId}/archive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to archive issue');
      }

      set((state) => ({
        issues: state.issues.filter((issue) => issue.id !== issueId),
        activeIssue: state.activeIssue?.id === issueId ? null : state.activeIssue,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to archive issue',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearFilters: () => {
    set({ filters: {} });
  },
}));
