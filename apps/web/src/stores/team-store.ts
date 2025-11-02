import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Team {
  id: string;
  workspaceId: string;
  name: string;
  identifier: string;
  description?: string | null;
  icon?: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
}

interface TeamState {
  teams: Team[];
  activeTeam: Team | null;
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
}

interface TeamActions {
  setTeams: (teams: Team[]) => void;
  setActiveTeam: (team: Team | null) => void;
  switchTeam: (teamId: string) => void;
  fetchTeams: (workspaceId: string, token: string) => Promise<void>;
  fetchTeamMembers: (teamId: string, token: string) => Promise<void>;
  createTeam: (
    workspaceId: string,
    data: { name: string; identifier: string; description?: string },
    token: string
  ) => Promise<Team>;
  updateTeam: (teamId: string, data: Partial<Team>, token: string) => Promise<void>;
  archiveTeam: (teamId: string, token: string) => Promise<void>;
  clearError: () => void;
}

type TeamStore = TeamState & TeamActions;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      // Initial state
      teams: [],
      activeTeam: null,
      members: [],
      isLoading: false,
      error: null,

      // Actions
      setTeams: (teams) => {
        set({ teams });
      },

      setActiveTeam: (team) => {
        set({ activeTeam: team });
      },

      switchTeam: (teamId) => {
        const { teams } = get();
        const team = teams.find((t) => t.id === teamId);
        if (team) {
          set({ activeTeam: team });
        }
      },

      fetchTeams: async (workspaceId: string, token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/teams`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch teams');
          }

          const data = await response.json();
          const activeTeams = (data.teams || []).filter((t: Team) => !t.archived);
          set({
            teams: activeTeams,
            isLoading: false,
          });

          // Set first team as active if none selected
          const { activeTeam } = get();
          if (!activeTeam && activeTeams.length > 0) {
            set({ activeTeam: activeTeams[0] });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch teams',
            isLoading: false,
          });
        }
      },

      fetchTeamMembers: async (teamId: string, token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/teams/${teamId}/members`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch team members');
          }

          const data = await response.json();
          set({
            members: data.members || [],
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch team members',
            isLoading: false,
          });
        }
      },

      createTeam: async (
        workspaceId: string,
        data: { name: string; identifier: string; description?: string },
        token: string
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/teams`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create team');
          }

          const result = await response.json();
          const newTeam = result.team;

          set((state) => ({
            teams: [...state.teams, newTeam],
            activeTeam: newTeam,
            isLoading: false,
          }));

          return newTeam;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create team',
            isLoading: false,
          });
          throw error;
        }
      },

      updateTeam: async (teamId: string, data: Partial<Team>, token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to update team');
          }

          const result = await response.json();
          const updatedTeam = result.team;

          set((state) => ({
            teams: state.teams.map((t) => (t.id === teamId ? updatedTeam : t)),
            activeTeam: state.activeTeam?.id === teamId ? updatedTeam : state.activeTeam,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update team',
            isLoading: false,
          });
          throw error;
        }
      },

      archiveTeam: async (teamId: string, token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/teams/${teamId}/archive`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to archive team');
          }

          set((state) => ({
            teams: state.teams.filter((t) => t.id !== teamId),
            activeTeam: state.activeTeam?.id === teamId ? null : state.activeTeam,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to archive team',
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
      name: 'team-storage',
      partialize: (state) => ({
        teams: state.teams,
        activeTeam: state.activeTeam,
      }),
    }
  )
);
