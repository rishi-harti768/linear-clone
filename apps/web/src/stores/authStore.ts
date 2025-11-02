import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// SECURITY NOTE: JWT Token Storage
// Current implementation stores tokens in localStorage for development convenience.
// ⚠️ SECURITY RISK: localStorage is vulnerable to XSS attacks
//
// For production deployment, consider one of these secure alternatives:
// 1. httpOnly cookies (recommended) - immune to XSS, managed by backend
// 2. sessionStorage - cleared on tab close, still vulnerable to XSS
// 3. Memory-only storage - lost on refresh, most secure but poor UX
//
// Migration path for production:
// - Move token management to httpOnly cookies set by backend
// - Remove token from persist configuration
// - Use cookie-based authentication for API requests
// - Keep user info in localStorage for UI display only

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        // State
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        // Actions
        setUser: (user) => set({ user, isAuthenticated: user !== null }),

        setToken: (token) => set({ token }),

        login: (user, token) =>
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          }),

        logout: () =>
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          }),

        setLoading: (isLoading) => set({ isLoading }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token, // TODO: Remove from localStorage in production, use httpOnly cookies
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);
