import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import {
  type CreateCycleInput,
  type UpdateCycleInput,
  createCycleSchema,
  updateCycleSchema,
} from '../schemas/cycle.schema';

type AuthVariables = { userId: string; userEmail: string };
const cycles = new Hono<{ Variables: AuthVariables }>();
cycles.use('*', authMiddleware);

// GET /api/teams/:teamId/cycles - List cycles
cycles.get('/teams/:teamId/cycles', async (c) => {
  try {
    const _teamId = c.req.param('teamId');
    const _userId = c.get('userId');
    return c.json({ data: { cycles: [] } });
  } catch (error) {
    console.error('List cycles error:', error);
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list cycles' } },
      500
    );
  }
});

// POST /api/teams/:teamId/cycles - Create cycle
cycles.post('/teams/:teamId/cycles', async (c) => {
  try {
    const _teamId = c.req.param('teamId');
    const _userId = c.get('userId');
    const validated: CreateCycleInput = createCycleSchema.parse(await c.req.json());
    return c.json(
      {
        data: {
          cycle: {
            id: 'placeholder',
            teamId: _teamId,
            number: 1,
            ...validated,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      },
      201
    );
  } catch (error) {
    console.error('Create cycle error:', error);
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
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create cycle' } },
      500
    );
  }
});

// GET /api/cycles/:id - Get cycle details
cycles.get('/:id', async (c) => {
  try {
    const cycleId = c.req.param('id');
    const _userId = c.get('userId');
    return c.json({
      data: {
        cycle: {
          id: cycleId,
          name: 'Placeholder Cycle',
          number: 1,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Get cycle error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Cycle not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get cycle' } },
      500
    );
  }
});

// PATCH /api/cycles/:id - Update cycle
cycles.patch('/:id', async (c) => {
  try {
    const cycleId = c.req.param('id');
    const _userId = c.get('userId');
    const validated: UpdateCycleInput = updateCycleSchema.parse(await c.req.json());
    return c.json({
      data: { cycle: { id: cycleId, ...validated, updatedAt: new Date().toISOString() } },
    });
  } catch (error) {
    console.error('Update cycle error:', error);
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
        return c.json({ error: { code: 'NOT_FOUND', message: 'Cycle not found' } }, 404);
      }
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update cycle' } },
      500
    );
  }
});

// DELETE /api/cycles/:id - Delete cycle
cycles.delete('/:id', async (c) => {
  try {
    const _cycleId = c.req.param('id');
    const _userId = c.get('userId');
    return c.json({ data: { message: 'Cycle deleted successfully' } });
  } catch (error) {
    console.error('Delete cycle error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Cycle not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete cycle' } },
      500
    );
  }
});

// GET /api/cycles/:id/issues - Get cycle issues
cycles.get('/:id/issues', async (c) => {
  try {
    const _cycleId = c.req.param('id');
    const _userId = c.get('userId');
    return c.json({ data: { issues: [] } });
  } catch (error) {
    console.error('Get cycle issues error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Cycle not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get cycle issues' } },
      500
    );
  }
});

// GET /api/cycles/:id/progress - Get cycle progress
cycles.get('/:id/progress', async (c) => {
  try {
    const _cycleId = c.req.param('id');
    const _userId = c.get('userId');
    return c.json({ data: { progress: { totalIssues: 0, completedIssues: 0, percentage: 0 } } });
  } catch (error) {
    console.error('Get cycle progress error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Cycle not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get cycle progress' } },
      500
    );
  }
});

export default cycles;
