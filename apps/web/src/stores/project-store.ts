import type { Project } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Project State Interface
 */
interface ProjectState {
  projects: Map<string, Project>; // projectId -> project
  activeProject: Project | null;
  isLoading: boolean;
}

/**
 * Project Actions Interface
 */
interface ProjectActions {
  setProjects: (projects: Project[]) => void;
  setActiveProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  archiveProject: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const initialState: ProjectState = {
  projects: new Map(),
  activeProject: null,
  isLoading: false,
};

/**
 * Project Store
 *
 * Manages project state with Map for O(1) lookups.
 * Supports CRUD operations and progress tracking.
 *
 * @example
 * ```tsx
 * const { projects, addProject, updateProject } = useProjectStore();
 *
 * // Add project
 * addProject(newProject);
 *
 * // Update project
 * updateProject(projectId, { status: 'in_progress' });
 * ```
 */
export const useProjectStore = create<ProjectState & ProjectActions>()(
  devtools(
    (set, _get) => ({
      ...initialState,

      setProjects: (projects) =>
        set(
          {
            projects: new Map(projects.map((project) => [project.id, project])),
          },
          false,
          'project/setProjects'
        ),

      setActiveProject: (project) =>
        set({ activeProject: project }, false, 'project/setActiveProject'),

      addProject: (project) =>
        set(
          (state) => {
            const newProjects = new Map(state.projects);
            newProjects.set(project.id, project);
            return { projects: newProjects };
          },
          false,
          'project/add'
        ),

      updateProject: (id, updates) =>
        set(
          (state) => {
            const newProjects = new Map(state.projects);
            const existingProject = newProjects.get(id);
            if (existingProject) {
              newProjects.set(id, { ...existingProject, ...updates });
            }
            return {
              projects: newProjects,
              activeProject:
                state.activeProject?.id === id
                  ? { ...state.activeProject, ...updates }
                  : state.activeProject,
            };
          },
          false,
          'project/update'
        ),

      removeProject: (id) =>
        set(
          (state) => {
            const newProjects = new Map(state.projects);
            newProjects.delete(id);
            return {
              projects: newProjects,
              activeProject: state.activeProject?.id === id ? null : state.activeProject,
            };
          },
          false,
          'project/remove'
        ),

      archiveProject: (id) =>
        set(
          (state) => {
            const newProjects = new Map(state.projects);
            const project = newProjects.get(id);
            if (project) {
              newProjects.set(id, { ...project, archived: true });
            }
            return { projects: newProjects };
          },
          false,
          'project/archive'
        ),

      setLoading: (isLoading) => set({ isLoading }, false, 'project/setLoading'),

      reset: () => set(initialState, false, 'project/reset'),
    }),
    { name: 'ProjectStore' }
  )
);

/**
 * Selector hooks for better performance
 */
export const useProjects = () => {
  const projects = useProjectStore((state) => state.projects);
  return Array.from(projects.values());
};

export const useProject = (id: string) => useProjectStore((state) => state.projects.get(id));

export const useProjectsByTeam = (teamId: string) => {
  const projects = useProjects();
  return projects.filter((project) => project.teamId === teamId && !project.archived);
};

export const useActiveProject = () => useProjectStore((state) => state.activeProject);
