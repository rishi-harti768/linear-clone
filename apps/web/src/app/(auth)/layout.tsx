import type { Metadata } from 'next';

/**
 * Authentication Layout Metadata
 */
export const metadata: Metadata = {
  title: {
    default: 'Authentication',
    template: '%s | Linear Clone',
  },
  description: 'Sign in or create an account to access Linear Clone',
};

/**
 * Authentication Layout Component
 *
 * Provides a centered card layout for authentication pages (login, register).
 * Following Linear's minimalist authentication design with proper spacing.
 *
 * Layout Structure:
 * - Full viewport height with centered content
 * - Maximum width container for readability
 * - Responsive design for mobile/tablet/desktop
 * - Background pattern for visual interest
 *
 * Used by:
 * - /login
 * - /register
 * - /forgot-password (future)
 *
 * @example
 * This layout wraps authentication pages automatically via Next.js route groups
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      {/* Background Pattern - Subtle grid for visual interest */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Content Container */}
      <div className="relative w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Linear Clone</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Modern issue tracking for high-performance teams
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[var(--surface-overlay)] border border-[var(--border-primary)] rounded-lg shadow-lg p-8">
          {children}
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-xs text-[var(--text-tertiary)]">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-[var(--primary)] hover:underline transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-[var(--primary)] hover:underline transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
