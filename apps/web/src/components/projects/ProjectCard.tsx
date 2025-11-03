'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { Project } from '@/types';
import { Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  teamId: string;
  className?: string;
}

/**
 * ProjectCard Component
 *
 * Displays a project card with progress visualization, status, and metadata.
 * Used in the projects list view (grid layout).
 *
 * Features:
 * - Color-coded border matching project color
 * - Status badge with color variants
 * - Progress ring visualization (placeholder for Phase 5)
 * - Target date display
 * - Lead avatar
 * - Quick stats (issues count placeholder)
 * - Hover state with elevation
 * - Click to navigate to project detail page
 *
 * @example
 * ```tsx
 * <ProjectCard project={project} teamId={teamId} />
 * ```
 */
export function ProjectCard({ project, teamId, className = '' }: ProjectCardProps) {
  const statusVariant = {
    planned: 'backlog',
    in_progress: 'inProgress',
    completed: 'done',
    cancelled: 'cancelled',
  }[project.status] as 'backlog' | 'inProgress' | 'done' | 'cancelled';

  const statusLabel = {
    planned: 'Planned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }[project.status];

  // TODO: Calculate actual progress from issues (Phase 5)
  const mockProgress =
    project.status === 'completed' ? 100 : project.status === 'in_progress' ? 65 : 0;

  return (
    <Link
      href={`/team/${teamId}/project/${project.id}`}
      className={`block rounded-lg border-2 bg-gray-900 p-5 transition-all hover:scale-[1.02] hover:shadow-lg ${className}`}
      style={{ borderColor: project.color }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-400">{project.description}</p>
          )}
        </div>
        <Badge variant={statusVariant} className="ml-2 shrink-0">
          {statusLabel}
        </Badge>
      </div>

      {/* Progress Ring (Placeholder) */}
      <div className="mb-4 flex items-center justify-center py-2">
        <div className="relative h-24 w-24">
          {/* Background circle */}
          <svg className="h-full w-full -rotate-90 transform" aria-label="Project progress">
            <title>Project completion progress</title>
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-800"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={project.color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(mockProgress / 100) * 251.2} 251.2`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          {/* Progress text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{mockProgress}%</span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-2">
        {/* Target Date */}
        {project.targetDate && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Due {formatDate(project.targetDate)}</span>
          </div>
        )}

        {/* Lead */}
        {project.lead && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <Avatar className="h-5 w-5">
              <AvatarImage src={project.lead.avatarUrl || undefined} alt={project.lead.name} />
              <AvatarFallback className="text-[10px]">
                {project.lead.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-400">{project.lead.name}</span>
          </div>
        )}
      </div>

      {/* Quick Stats (Placeholder) */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3">
        <div className="text-sm text-gray-400">
          <span className="font-medium text-white">0</span> issues
        </div>
        <div className="text-sm text-gray-400">
          <span className="font-medium text-white">0</span> done
        </div>
      </div>
    </Link>
  );
}
