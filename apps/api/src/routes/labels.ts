import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import {
  type CreateLabelInput,
  type UpdateLabelInput,
  createLabelSchema,
  updateLabelSchema,
} from '../schemas/label.schema';

type AuthVariables = { userId: string; userEmail: string };
const labels = new Hono<{ Variables: AuthVariables }>();
labels.use('*', authMiddleware);

// GET /api/teams/:teamId/labels - List labels
labels.get('/teams/:teamId/labels', async (c) => {
  try {
    const _teamId = c.req.param('teamId');
    const _userId = c.get('userId');
    return c.json({ data: { labels: [] } });
  } catch (error) {
    console.error('List labels error:', error);
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list labels' } },
      500
    );
  }
});

// POST /api/teams/:teamId/labels - Create label
labels.post('/teams/:teamId/labels', async (c) => {
  try {
    const _teamId = c.req.param('teamId');
    const _userId = c.get('userId');
    const validated: CreateLabelInput = createLabelSchema.parse(await c.req.json());
    return c.json(
      {
        data: {
          label: {
            id: 'placeholder',
            teamId: _teamId,
            ...validated,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      },
      201
    );
  } catch (error) {
    console.error('Create label error:', error);
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
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create label' } },
      500
    );
  }
});

// PATCH /api/labels/:id - Update label
labels.patch('/:id', async (c) => {
  try {
    const labelId = c.req.param('id');
    const _userId = c.get('userId');
    const validated: UpdateLabelInput = updateLabelSchema.parse(await c.req.json());
    return c.json({
      data: { label: { id: labelId, ...validated, updatedAt: new Date().toISOString() } },
    });
  } catch (error) {
    console.error('Update label error:', error);
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
        return c.json({ error: { code: 'NOT_FOUND', message: 'Label not found' } }, 404);
      }
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update label' } },
      500
    );
  }
});

// DELETE /api/labels/:id - Delete label
labels.delete('/:id', async (c) => {
  try {
    const _labelId = c.req.param('id');
    const _userId = c.get('userId');
    return c.json({ data: { message: 'Label deleted successfully' } });
  } catch (error) {
    console.error('Delete label error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Label not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete label' } },
      500
    );
  }
});

export default labels;
