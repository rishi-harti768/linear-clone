import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import {
  type CreateProjectInput,
  type UpdateProjectInput,
  createProjectSchema,
  updateProjectSchema,
} from '../schemas/project.schema';

type AuthVariables = { userId: string; userEmail: string };
const projects = new Hono<{ Variables: AuthVariables }>();
projects.use('*', authMiddleware);

// GET /api/teams/:teamId/projects - List projects
projects.get('/teams/:teamId/projects', async (c) => {
  try {
    const _teamId = c.req.param('teamId');
    const _userId = c.get('userId');
    return c.json({ data: { projects: [] } });
  } catch (error) {
    console.error('List projects error:', error);
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list projects' } },
      500
    );
  }
});

// POST /api/teams/:teamId/projects - Create project
projects.post('/teams/:teamId/projects', async (c) => {
  try {
    const _teamId = c.req.param('teamId');
    const _userId = c.get('userId');
    const validated: CreateProjectInput = createProjectSchema.parse(await c.req.json());
    return c.json(
      {
        data: {
          project: {
            id: 'placeholder',
            teamId: _teamId,
            ...validated,
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      },
      201
    );
  } catch (error) {
    console.error('Create project error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: process.env.NODE_ENV === 'development' ? error : undefined,
          },
        },
        422
      );
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create project' } },
      500
    );
  }
});

// GET /api/projects/:id - Get project details
projects.get('/:id', async (c) => {
  try {
    const projectId = c.req.param('id');
    const _userId = c.get('userId');
    return c.json({
      data: {
        project: {
          id: projectId,
          name: 'Placeholder Project',
          status: 'planned',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get project' } },
      500
    );
  }
});

// PATCH /api/projects/:id - Update project
projects.patch('/:id', async (c) => {
  try {
    const projectId = c.req.param('id');
    const _userId = c.get('userId');
    const validated: UpdateProjectInput = updateProjectSchema.parse(await c.req.json());
    return c.json({
      data: { project: { id: projectId, ...validated, updatedAt: new Date().toISOString() } },
    });
  } catch (error) {
    console.error('Update project error:', error);
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return c.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: process.env.NODE_ENV === 'development' ? error : undefined,
            },
          },
          422
        );
      }
      if (error.message.includes('not found')) {
        return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404);
      }
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update project' } },
      500
    );
  }
});

// DELETE /api/projects/:id - Delete project
projects.delete('/:id', async (c) => {
  try {
    const _projectId = c.req.param('id');
    const _userId = c.get('userId');
    return c.json({ data: { message: 'Project deleted successfully' } });
  } catch (error) {
    console.error('Delete project error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete project' } },
      500
    );
  }
});

// GET /api/projects/:id/issues - Get project issues
projects.get('/:id/issues', async (c) => {
  try {
    const _projectId = c.req.param('id');
    const _userId = c.get('userId');
    return c.json({ data: { issues: [] } });
  } catch (error) {
    console.error('Get project issues error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get project issues' } },
      500
    );
  }
});

// GET /api/projects/:id/progress - Get project progress
projects.get('/:id/progress', async (c) => {
  try {
    const _projectId = c.req.param('id');
    const _userId = c.get('userId');
    return c.json({ data: { progress: { totalIssues: 0, completedIssues: 0, percentage: 0 } } });
  } catch (error) {
    console.error('Get project progress error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get project progress' } },
      500
    );
  }
});

export default projects;
