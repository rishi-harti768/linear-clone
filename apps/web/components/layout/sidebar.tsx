'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/src/stores/ui-store';
import { useWorkspaceStore } from '@/src/stores/workspace-store';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Layers,
  Settings,
  Target,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { activeWorkspace, workspaces, switchWorkspace } = useWorkspaceStore();

  const navigationItems = [
    { icon: Inbox, label: 'My Issues', href: '/app/my-issues' },
    { icon: Inbox, label: 'Inbox', href: '/app/inbox', badge: 3 },
    { icon: Layers, label: 'Views', href: '/app/views' },
  ];

  const teamItems = [
    {
      icon: Target,
      label: 'Issues',
      href: activeWorkspace ? `/app/team/${activeWorkspace.id}/issues` : '#',
    },
    {
      icon: Layers,
      label: 'Projects',
      href: activeWorkspace ? `/app/team/${activeWorkspace.id}/projects` : '#',
    },
    {
      icon: Target,
      label: 'Cycles',
      href: activeWorkspace ? `/app/team/${activeWorkspace.id}/cycles` : '#',
    },
    {
      icon: Users,
      label: 'Members',
      href: activeWorkspace ? `/app/team/${activeWorkspace.id}/members` : '#',
    },
  ];

  if (isSidebarCollapsed) {
    return (
      <aside className="flex w-16 flex-col border-r bg-card">
        <div className="flex h-14 items-center justify-center border-b px-3">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-1 flex-col items-center gap-2 p-2">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      {/* Header with Workspace Switcher */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent">
              <Avatar className="h-6 w-6">
                <AvatarImage src={activeWorkspace?.icon ?? undefined} alt={activeWorkspace?.name} />
                <AvatarFallback className="text-xs">
                  {activeWorkspace?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-left text-sm font-medium">
                {activeWorkspace?.name || 'Select Workspace'}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => switchWorkspace(workspace.id)}
                className={cn(
                  'flex items-center gap-2',
                  activeWorkspace?.id === workspace.id && 'bg-accent'
                )}
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={workspace.icon ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {workspace.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{workspace.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>Create Workspace</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button variant="ghost" className="w-full justify-start gap-3 px-3">
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Button>
          </Link>
        ))}

        <Separator className="my-2" />

        {/* Team Section */}
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">TEAM</div>
        {teamItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button variant="ghost" className="w-full justify-start gap-3 px-3">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          </Link>
        ))}

        <Separator className="my-2" />

        {/* Settings */}
        <Link href="/app/settings">
          <Button variant="ghost" className="w-full justify-start gap-3 px-3">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </Link>
      </nav>
    </aside>
  );
}
