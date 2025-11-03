/**
 * Better Auth Client Configuration
 *
 * This client connects to our existing Hono.js backend API
 * We're using Better Auth's React client for UI patterns and session management,
 * but connecting to our custom JWT backend implementation.
 */

import { createAuthClient } from 'better-auth/react';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Better Auth client instance
 * Configured to work with our existing backend at /api/auth
 */
export const authClient = createAuthClient({
  baseURL: baseURL,
  // Our backend uses /api/auth/* for auth endpoints
  // This matches our existing Hono.js routes
});

/**
 * Export individual hooks and methods for convenience
 */
export const { signIn, signUp, signOut, useSession, getSession, updateUser } = authClient;

/**
 * Custom adapter to bridge Better Auth with our existing API
 * This allows us to use Better Auth UI patterns while maintaining
 * compatibility with our JWT-based backend
 */
export const authAdapter = {
  /**
   * Register a new user
   * Maps Better Auth signup to our POST /api/v1/auth/register endpoint
   */
  async register(data: { email: string; password: string; name: string }) {
    console.log('[Auth] Registering user:', { email: data.email, name: data.name });
    const url = `${baseURL}/api/v1/auth/register`;
    console.log('[Auth] POST', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    console.log('[Auth] Register response:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json();
      console.error('[Auth] Register error:', error);
      throw new Error(error.error?.message || 'Registration failed');
    }

    const result = await response.json();
    console.log('[Auth] Register success');
    return result;
  },

  /**
   * Login with email and password
   * Maps to our POST /api/v1/auth/login endpoint
   */
  async login(data: { email: string; password: string }) {
    console.log('[Auth] Logging in user:', data.email);
    const url = `${baseURL}/api/v1/auth/login`;
    console.log('[Auth] POST', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    console.log('[Auth] Login response:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json();
      console.error('[Auth] Login error:', error);
      throw new Error(error.error?.message || 'Login failed');
    }

    const result = await response.json();
    console.log('[Auth] Login success');
    return result;
  },

  /**
   * Logout the current user
   * Maps to our POST /api/v1/auth/logout endpoint
   */
  async logout() {
    const token = localStorage.getItem('authToken');
    console.log('[Auth] Logging out');

    const response = await fetch(`${baseURL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Auth] Logout error:', error);
      throw new Error(error.error?.message || 'Logout failed');
    }

    // Clear local storage
    localStorage.removeItem('authToken');
    console.log('[Auth] Logout success');

    return response.json();
  },

  /**
   * Get current user session
   * Maps to our GET /api/v1/auth/me endpoint
   */
  async getCurrentUser() {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.log('[Auth] No token found in localStorage');
      return null;
    }

    console.log('[Auth] Getting current user');

    try {
      const response = await fetch(`${baseURL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const status = response.status;
        console.error('[Auth] Get current user failed:', status);

        // Only clear token on 401 Unauthorized (invalid/expired token)
        // Keep token for network errors (500, timeout) to prevent unnecessary logouts
        if (status === 401 || status === 403) {
          console.warn('[Auth] Token invalid or expired - clearing');
          localStorage.removeItem('authToken');
          return null;
        }

        // For other errors (network issues, 500, etc), keep the token
        // User will stay logged in and can retry
        console.warn('[Auth] Network/server error - keeping session active');
        throw new Error(`API error: ${status}`);
      }

      const data = await response.json();
      console.log('[Auth] Current user retrieved');
      return data.data.user;
    } catch (error) {
      // Network errors, CORS issues, etc.
      console.warn('[Auth] Request failed but keeping session:', error);
      // Don't clear token on network errors
      throw error;
    }
  },
};
