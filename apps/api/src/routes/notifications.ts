import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

type AuthVariables = { userId: string; userEmail: string };
const notifications = new Hono<{ Variables: AuthVariables }>();
notifications.use('*', authMiddleware);

// GET /api/notifications - List user notifications
notifications.get('/', async (c) => {
  try {
    const _userId = c.get('userId');
    const query = c.req.query();
    const page = query.page ? Number.parseInt(query.page) : 1;
    const limit = query.limit ? Number.parseInt(query.limit) : 50;
    // TODO: Implement service layer
    // const result = await notificationService.listNotifications(userId, { page, limit });
    return c.json({
      data: { notifications: [], meta: { page, limit, totalPages: 0, totalCount: 0 } },
    });
  } catch (error) {
    console.error('List notifications error:', error);
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list notifications' } },
      500
    );
  }
});

// PATCH /api/notifications/:id/read - Mark as read
notifications.patch('/:id/read', async (c) => {
  try {
    const notificationId = c.req.param('id');
    const _userId = c.get('userId');
    // TODO: Implement service layer
    // await notificationService.markAsRead(notificationId, userId);
    return c.json({
      data: {
        notification: { id: notificationId, read: true, updatedAt: new Date().toISOString() },
      },
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Notification not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to mark notification as read' } },
      500
    );
  }
});

// POST /api/notifications/read-all - Mark all as read
notifications.post('/read-all', async (c) => {
  try {
    const _userId = c.get('userId');
    // TODO: Implement service layer
    // await notificationService.markAllAsRead(userId);
    return c.json({ data: { message: 'All notifications marked as read' } });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark all notifications as read',
        },
      },
      500
    );
  }
});

// PATCH /api/notifications/:id/archive - Archive notification
notifications.patch('/:id/archive', async (c) => {
  try {
    const notificationId = c.req.param('id');
    const _userId = c.get('userId');
    // TODO: Implement service layer
    // await notificationService.archive(notificationId, userId);
    return c.json({
      data: {
        notification: { id: notificationId, archived: true, updatedAt: new Date().toISOString() },
      },
    });
  } catch (error) {
    console.error('Archive notification error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Notification not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to archive notification' } },
      500
    );
  }
});

export default notifications;
