import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AppPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Linear Clone</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your dashboard for project management and issue tracking
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">My Issues</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            View and manage issues assigned to you
          </p>
          <Link href="/app/my-issues">
            <Button variant="link" className="mt-4 p-0">
              View Issues →
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Projects</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse and manage your team's projects
          </p>
          <Link href="/app/projects">
            <Button variant="link" className="mt-4 p-0">
              View Projects →
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Cycles</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Track progress across development cycles
          </p>
          <Link href="/app/cycles">
            <Button variant="link" className="mt-4 p-0">
              View Cycles →
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Get Started</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Phase 4.2 Complete: State Management & Core Layouts
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          ✅ Zustand stores • ✅ Authentication pages • ✅ App layouts • ✅ Sidebar & Navigation
        </p>
      </div>
    </div>
  );
}
