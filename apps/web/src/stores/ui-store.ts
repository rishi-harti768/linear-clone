import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Theme type
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * UI State Interface
 */
interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  activeModal: string | null;
  modalData: unknown;
}

/**
 * UI Actions Interface
 */
interface UIActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;
  reset: () => void;
}

const initialState: UIState = {
  theme: 'system',
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  activeModal: null,
  modalData: null,
};

/**
 * UI Store
 *
 * Manages global UI state including theme, sidebar, modals, and command palette.
 * Persists user preferences across sessions.
 *
 * @example
 * ```tsx
 * const { theme, setTheme, openCommandPalette } = useUIStore();
 *
 * // Change theme
 * setTheme('dark');
 *
 * // Open command palette
 * openCommandPalette();
 *
 * // Open modal with data
 * openModal('create-issue', { teamId: '123' });
 * ```
 */
export const useUIStore = create<UIState & UIActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setTheme: (theme) => {
          set({ theme }, false, 'ui/setTheme');

          // Apply theme to document
          if (typeof document !== 'undefined') {
            if (theme === 'system') {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              document.documentElement.classList.toggle('dark', prefersDark);
            } else {
              document.documentElement.classList.toggle('dark', theme === 'dark');
            }
          }
        },

        toggleTheme: () =>
          set(
            (state) => {
              const newTheme =
                state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'system' : 'light';

              // Apply theme to document
              if (typeof document !== 'undefined') {
                if (newTheme === 'system') {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.classList.toggle('dark', prefersDark);
                } else {
                  document.documentElement.classList.toggle('dark', newTheme === 'dark');
                }
              }

              return { theme: newTheme };
            },
            false,
            'ui/toggleTheme'
          ),

        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }, false, 'ui/setSidebarCollapsed'),

        toggleSidebar: () =>
          set(
            (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
            false,
            'ui/toggleSidebar'
          ),

        openCommandPalette: () => set({ commandPaletteOpen: true }, false, 'ui/openCommandPalette'),

        closeCommandPalette: () =>
          set({ commandPaletteOpen: false }, false, 'ui/closeCommandPalette'),

        toggleCommandPalette: () =>
          set(
            (state) => ({ commandPaletteOpen: !state.commandPaletteOpen }),
            false,
            'ui/toggleCommandPalette'
          ),

        openModal: (modalId, data) =>
          set({ activeModal: modalId, modalData: data }, false, 'ui/openModal'),

        closeModal: () => set({ activeModal: null, modalData: null }, false, 'ui/closeModal'),

        reset: () => set(initialState, false, 'ui/reset'),
      }),
      {
        name: 'linear-clone-ui',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

/**
 * Selector hooks
 */
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebarCollapsed);
export const useCommandPaletteOpen = () => useUIStore((state) => state.commandPaletteOpen);
export const useActiveModal = () => useUIStore((state) => state.activeModal);
export const useModalData = () => useUIStore((state) => state.modalData);
