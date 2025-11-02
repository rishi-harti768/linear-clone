import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Linear Clone',
  description: 'Sign in or create an account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Linear Clone</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Project management for high-performing teams
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
