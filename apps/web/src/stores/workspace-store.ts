import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  members: WorkspaceMember[];
  isLoading: boolean;
  error: string | null;
}

interface WorkspaceActions {
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  switchWorkspace: (workspaceId: string) => void;
  fetchWorkspaces: (token: string) => Promise<void>;
  fetchWorkspaceMembers: (workspaceId: string, token: string) => Promise<void>;
  createWorkspace: (
    data: { name: string; slug: string; icon?: string },
    token: string
  ) => Promise<Workspace>;
  updateWorkspace: (workspaceId: string, data: Partial<Workspace>, token: string) => Promise<void>;
  clearError: () => void;
}

type WorkspaceStore = WorkspaceState & WorkspaceActions;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      workspaces: [],
      activeWorkspace: null,
      members: [],
      isLoading: false,
      error: null,

      // Actions
      setWorkspaces: (workspaces) => {
        set({ workspaces });
      },

      setActiveWorkspace: (workspace) => {
        set({ activeWorkspace: workspace });
      },

      switchWorkspace: (workspaceId) => {
        const { workspaces } = get();
        const workspace = workspaces.find((w) => w.id === workspaceId);
        if (workspace) {
          set({ activeWorkspace: workspace });
        }
      },

      fetchWorkspaces: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/workspaces`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch workspaces');
          }

          const data = await response.json();
          set({
            workspaces: data.workspaces || [],
            isLoading: false,
          });

          // Set first workspace as active if none selected
          const { activeWorkspace } = get();
          if (!activeWorkspace && data.workspaces.length > 0) {
            set({ activeWorkspace: data.workspaces[0] });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch workspaces',
            isLoading: false,
          });
        }
      },

      fetchWorkspaceMembers: async (workspaceId: string, token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/members`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch workspace members');
          }

          const data = await response.json();
          set({
            members: data.members || [],
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch members',
            isLoading: false,
          });
        }
      },

      createWorkspace: async (
        data: { name: string; slug: string; icon?: string },
        token: string
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/workspaces`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create workspace');
          }

          const result = await response.json();
          const newWorkspace = result.workspace;

          set((state) => ({
            workspaces: [...state.workspaces, newWorkspace],
            activeWorkspace: newWorkspace,
            isLoading: false,
          }));

          return newWorkspace;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create workspace',
            isLoading: false,
          });
          throw error;
        }
      },

      updateWorkspace: async (workspaceId: string, data: Partial<Workspace>, token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to update workspace');
          }

          const result = await response.json();
          const updatedWorkspace = result.workspace;

          set((state) => ({
            workspaces: state.workspaces.map((w) => (w.id === workspaceId ? updatedWorkspace : w)),
            activeWorkspace:
              state.activeWorkspace?.id === workspaceId ? updatedWorkspace : state.activeWorkspace,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update workspace',
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        workspaces: state.workspaces,
        activeWorkspace: state.activeWorkspace,
      }),
    }
  )
);
