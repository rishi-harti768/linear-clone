'use client';

import { IssueRow, IssueStatusBadge } from '@/components/issues';
import { ProjectForm } from '@/components/projects';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useIssues } from '@/stores/issue-store';
import { useProject, useProjectStore } from '@/stores/project-store';
import type { Issue, IssueStatus, ProjectStatus } from '@/types';
import { ArrowLeft, Calendar, Edit2, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

interface ProjectFormData {
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  targetDate?: string;
  leadId?: string;
  color: string;
}

/**
 * Project Detail Page
 *
 * Displays comprehensive project information with progress visualization.
 * Features:
 * - Project header with status, dates, and lead
 * - Progress chart/ring with completion percentage
 * - Issues grouped by status
 * - Project activity feed (placeholder)
 * - Edit project button
 *
 * @example Route: /team/[teamId]/project/[projectId]
 */
export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const teamId = params?.teamId as string;
  const project = useProject(projectId);
  const allIssues = useIssues();
  const updateProject = useProjectStore((state) => state.updateProject);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter issues for this project
  const projectIssues = allIssues.filter((issue) => issue.projectId === projectId);

  // Group issues by status
  const issuesByStatus: Record<IssueStatus, Issue[]> = {
    backlog: projectIssues.filter((i) => i.status === 'backlog'),
    todo: projectIssues.filter((i) => i.status === 'todo'),
    in_progress: projectIssues.filter((i) => i.status === 'in_progress'),
    done: projectIssues.filter((i) => i.status === 'done'),
    cancelled: projectIssues.filter((i) => i.status === 'cancelled'),
  };

  // Calculate progress
  const totalIssues = projectIssues.length;
  const doneIssues = issuesByStatus.done.length;
  const progress = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;

  const handleEditProject = async (data: ProjectFormData) => {
    if (!project) return;
    // TODO: Integrate with API (Phase 5)
    updateProject(projectId, {
      name: data.name,
      description: data.description || null,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : null,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      leadId: data.leadId || null,
      color: data.color,
      updatedAt: new Date(),
    });
    setIsEditModalOpen(false);
  };

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">Project not found</h2>
          <p className="mt-2 text-sm text-gray-400">
            The project you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-400">Back to Projects</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: project.color }} />
              <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>
            {project.description && (
              <p className="mt-2 text-sm text-gray-400">{project.description}</p>
            )}

            {/* Metadata */}
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-400">
              {project.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Started {formatDate(project.startDate)}</span>
                </div>
              )}
              {project.targetDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due {formatDate(project.targetDate)}</span>
                </div>
              )}
              {project.lead && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={project.lead.avatarUrl || undefined}
                      alt={project.lead.name}
                    />
                    <AvatarFallback className="text-[10px]">
                      {project.lead.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{project.lead.name}</span>
                </div>
              )}
            </div>
          </div>

          <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-950">
        <div className="p-6">
          {/* Progress Section */}
          <div className="mb-8 rounded-lg border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Progress</h2>
            <div className="flex items-center gap-8">
              {/* Progress Ring */}
              <div className="relative h-32 w-32 shrink-0">
                <svg className="h-full w-full -rotate-90 transform" aria-label="Project progress">
                  <title>Project completion {progress}%</title>
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={project.color}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(progress / 100) * 351.68} 351.68`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{progress}%</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid flex-1 grid-cols-5 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">{totalIssues}</div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {issuesByStatus.backlog.length}
                  </div>
                  <div className="text-sm text-gray-400">Backlog</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{issuesByStatus.todo.length}</div>
                  <div className="text-sm text-gray-400">Todo</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {issuesByStatus.in_progress.length}
                  </div>
                  <div className="text-sm text-gray-400">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{issuesByStatus.done.length}</div>
                  <div className="text-sm text-gray-400">Done</div>
                </div>
              </div>
            </div>
          </div>

          {/* Issues Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-white">Issues ({totalIssues})</h2>
            {totalIssues === 0 ? (
              <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
                <p className="text-gray-400">No issues in this project yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(['backlog', 'todo', 'in_progress', 'done', 'cancelled'] as IssueStatus[]).map(
                  (status) => {
                    const statusIssues = issuesByStatus[status];
                    if (statusIssues.length === 0) return null;

                    return (
                      <div key={status}>
                        <div className="mb-2 flex items-center gap-2">
                          <IssueStatusBadge status={status} />
                          <span className="text-sm text-gray-400">({statusIssues.length})</span>
                        </div>
                        <div className="space-y-1 rounded-lg border border-gray-800 bg-gray-900">
                          {statusIssues.map((issue) => (
                            <IssueRow key={issue.id} issue={issue} teamId={teamId} />
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Activity Section (Placeholder) */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Activity</h2>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
              <p className="text-gray-400">Project activity will be displayed here in Phase 4.14</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      <ProjectForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditProject}
        initialData={project}
        mode="edit"
      />
    </div>
  );
}
