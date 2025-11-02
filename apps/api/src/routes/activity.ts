import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

type AuthVariables = { userId: string; userEmail: string };
const activity = new Hono<{ Variables: AuthVariables }>();
activity.use('*', authMiddleware);

// GET /api/activity - Get user activity feed
activity.get('/', async (c) => {
  try {
    const _userId = c.get('userId');
    const query = c.req.query();
    const page = query.page ? Number.parseInt(query.page) : 1;
    const limit = query.limit ? Number.parseInt(query.limit) : 50;
    // TODO: Implement service layer
    // const result = await activityService.getUserActivity(userId, { page, limit });
    return c.json({ data: { activity: [], meta: { page, limit, totalPages: 0, totalCount: 0 } } });
  } catch (error) {
    console.error('Get user activity error:', error);
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get activity feed' } },
      500
    );
  }
});

// GET /api/workspaces/:id/activity - Get workspace activity
activity.get('/workspaces/:id/activity', async (c) => {
  try {
    const _workspaceId = c.req.param('id');
    const _userId = c.get('userId');
    const query = c.req.query();
    const page = query.page ? Number.parseInt(query.page) : 1;
    const limit = query.limit ? Number.parseInt(query.limit) : 50;
    // TODO: Implement service layer
    // const result = await activityService.getWorkspaceActivity(workspaceId, userId, { page, limit });
    return c.json({ data: { activity: [], meta: { page, limit, totalPages: 0, totalCount: 0 } } });
  } catch (error) {
    console.error('Get workspace activity error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Workspace not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get workspace activity' } },
      500
    );
  }
});

export default activity;
