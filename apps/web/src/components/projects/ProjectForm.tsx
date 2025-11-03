'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Project, ProjectStatus } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

/**
 * Project Form Data Interface
 */
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
 * Project Form Props
 */
interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  initialData?: Partial<Project>;
  mode?: 'create' | 'edit';
}

// Validation schema matching database constraints
const projectFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  leadId: z.string().uuid().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid hex color'),
});

// Predefined color options
const COLOR_OPTIONS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Lime', value: '#84cc16' },
  { label: 'Green', value: '#10b981' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Sky', value: '#0ea5e9' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Violet', value: '#7c3aed' },
];

/**
 * ProjectForm Component
 *
 * Create/edit project modal with all project properties.
 * Uses React Hook Form + Zod for validation.
 *
 * Features:
 * - All 7 project fields (name, description, status, dates, lead, color)
 * - Color picker with predefined options
 * - Form validation with error messages
 * - Keyboard shortcut: Cmd/Ctrl+Enter to submit
 * - Reset on submit/close
 * - Create vs Edit modes
 *
 * @example
 * ```tsx
 * <ProjectForm
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSubmit={handleSubmit}
 *   mode="create"
 * />
 * ```
 */
export function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'planned',
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().split('T')[0]
        : '',
      targetDate: initialData?.targetDate
        ? new Date(initialData.targetDate).toISOString().split('T')[0]
        : '',
      leadId: initialData?.leadId || '',
      color: initialData?.color || '#6366f1',
    },
  });

  const selectedColor = watch('color');

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || '',
        description: initialData?.description || '',
        status: initialData?.status || 'planned',
        startDate: initialData?.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : '',
        targetDate: initialData?.targetDate
          ? new Date(initialData.targetDate).toISOString().split('T')[0]
          : '',
        leadId: initialData?.leadId || '',
        color: initialData?.color || '#6366f1',
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = useCallback(
    async (data: ProjectFormData) => {
      setIsSubmitting(true);
      try {
        await onSubmit(data);
        reset();
        onClose();
      } catch (error) {
        console.error('Failed to submit project:', error);
        // TODO: Show error toast notification (Phase 4.20)
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, reset, onClose]
  );

  // Keyboard shortcut: Cmd/Ctrl+Enter to submit
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(handleFormSubmit)();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSubmit, handleFormSubmit]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Project' : 'Edit Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Name *
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Website Redesign"
              className="mt-1"
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the project goals and scope"
              className="mt-1"
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300">
              Status *
            </label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value as ProjectStatus)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="mt-1 text-sm text-red-400">{errors.status.message}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                Start Date
              </label>
              <Input id="startDate" type="date" {...register('startDate')} className="mt-1" />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-400">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-gray-300">
                Target Date
              </label>
              <Input id="targetDate" type="date" {...register('targetDate')} className="mt-1" />
              {errors.targetDate && (
                <p className="mt-1 text-sm text-red-400">{errors.targetDate.message}</p>
              )}
            </div>
          </div>

          {/* Color Picker */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-300">Project Color *</legend>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue('color', color.value)}
                  className={`h-10 w-10 rounded-md transition-all hover:scale-110 ${
                    selectedColor === color.value
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                      : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                  aria-label={`Select ${color.label} color`}
                />
              ))}
            </div>
            {errors.color && <p className="mt-1 text-sm text-red-400">{errors.color.message}</p>}
          </fieldset>

          {/* Lead (Placeholder) */}
          <div>
            <label htmlFor="leadId" className="block text-sm font-medium text-gray-300">
              Project Lead
            </label>
            <Select value={watch('leadId')} onValueChange={(value) => setValue('leadId', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select project lead (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {/* TODO: Load team members from API (Phase 5) */}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              Team member selection will be available in Phase 5
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Updating...'
                : mode === 'create'
                  ? 'Create Project'
                  : 'Update Project'}
            </Button>
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-gray-500">
            Press <kbd className="rounded bg-gray-800 px-1.5 py-0.5">⌘</kbd> +{' '}
            <kbd className="rounded bg-gray-800 px-1.5 py-0.5">Enter</kbd> to submit
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
