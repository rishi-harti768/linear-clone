import type { ReactNode } from 'react';

/**
 * Main Application Layout
 *
 * This layout wraps all authenticated pages and provides:
 * - Sidebar navigation (left)
 * - Top navigation bar (top)
 * - Main content area (center)
 * - Command palette integration (global)
 * - Notification system (global)
 *
 * Layout Structure:
 * - Fixed sidebar (240px width, collapsible to 64px)
 * - Fixed top nav (56px height)
 * - Scrollable main content area
 * - Full viewport height (100vh)
 *
 * @see Phase 4.5 for Sidebar and TopNav component implementations
 */

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-base">
      {/* Sidebar Navigation - Fixed Left (Phase 4.5 implementation) */}
      <aside
        className="hidden h-full w-60 shrink-0 border-r border-border-subtle bg-surface-raised lg:block"
        aria-label="Primary navigation"
      >
        <div className="flex h-full flex-col">
          {/* Workspace/Team Switcher */}
          <div className="flex h-14 items-center border-b border-border-subtle px-4">
            <div className="flex items-center gap-2">
              {/* Placeholder for workspace switcher dropdown */}
              <div className="h-8 w-8 rounded bg-surface-hovered" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-24 rounded bg-surface-hovered" />
                <div className="h-2 w-16 rounded bg-surface-hovered" />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <div className="space-y-1">
              {/* Placeholder for navigation items */}
              {['My Issues', 'Inbox', 'Views'].map((item) => (
                <div key={item} className="h-8 rounded px-3 py-1.5 text-sm text-text-secondary">
                  {item}
                </div>
              ))}

              {/* Teams Section */}
              <div className="mt-4 space-y-1">
                <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Teams
                </div>
                {/* Placeholder for team list */}
                <div className="h-8 rounded px-3 py-1.5 text-sm text-text-secondary">
                  Engineering
                </div>
              </div>

              {/* Projects Section */}
              <div className="mt-4 space-y-1">
                <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Projects
                </div>
                {/* Placeholder for project list */}
                <div className="h-8 rounded px-3 py-1.5 text-sm text-text-secondary">
                  Q1 Roadmap
                </div>
              </div>

              {/* Cycles Section */}
              <div className="mt-4 space-y-1">
                <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Cycles
                </div>
                {/* Placeholder for cycle list */}
                <div className="h-8 rounded px-3 py-1.5 text-sm text-text-secondary">
                  Current Cycle
                </div>
              </div>
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-border-subtle p-2">
            <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-surface-hovered">
              {/* Placeholder for user avatar */}
              <div className="h-7 w-7 rounded-full bg-surface-hovered" />
              <div className="flex flex-1 flex-col">
                <div className="h-3 w-20 rounded bg-surface-hovered" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar - Fixed Top (Phase 4.5 implementation) */}
        <header
          className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-surface-raised px-4"
          aria-label="Top navigation"
        >
          {/* Mobile Menu Button (Hidden on Desktop) */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-surface-hovered lg:hidden"
            aria-label="Toggle menu"
          >
            <div className="h-4 w-4 bg-text-secondary" />
          </button>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-tertiary">Issues</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search/Command Palette Trigger */}
            <button
              type="button"
              className="flex h-8 items-center gap-2 rounded border border-border-subtle bg-surface-base px-3 text-sm text-text-tertiary hover:border-border-base hover:bg-surface-hovered"
              aria-label="Open command palette"
            >
              <span>Search...</span>
              <kbd className="text-xs">⌘K</kbd>
            </button>

            {/* Create Issue Button */}
            <button
              type="button"
              className="h-8 rounded bg-brand px-3 text-sm font-medium text-white hover:bg-brand-hover"
              aria-label="Create new issue"
            >
              New Issue
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-surface-hovered"
              aria-label="Notifications"
            >
              <div className="h-4 w-4 bg-text-secondary" />
            </button>

            {/* User Menu */}
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-surface-hovered"
              aria-label="User menu"
            />
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-surface-base">
          <div className="h-full">{children}</div>
        </main>
      </div>

      {/* Command Palette - Global (Phase 4.6 implementation) */}
      {/* Will be rendered here as a portal/modal when implemented */}

      {/* Notification Popover - Global (Phase 4.12 implementation) */}
      {/* Will be rendered here as a portal when implemented */}
    </div>
  );
}
