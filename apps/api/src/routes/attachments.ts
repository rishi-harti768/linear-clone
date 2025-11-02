import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

type AuthVariables = { userId: string; userEmail: string };
const attachments = new Hono<{ Variables: AuthVariables }>();
attachments.use('*', authMiddleware);

// POST /api/attachments - Upload attachment
attachments.post('/', async (c) => {
  try {
    const _userId = c.get('userId');
    // TODO: Implement file upload handling
    // const file = await c.req.parseBody();
    // const attachment = await attachmentService.upload(file, userId);
    return c.json(
      {
        data: {
          attachment: {
            id: 'placeholder',
            filename: 'example.pdf',
            url: 'https://example.com/files/example.pdf',
            mimeType: 'application/pdf',
            size: 12345,
            createdAt: new Date().toISOString(),
          },
        },
      },
      201
    );
  } catch (error) {
    console.error('Upload attachment error:', error);
    if (error instanceof Error) {
      if (error.message.includes('file too large')) {
        return c.json(
          { error: { code: 'BAD_REQUEST', message: 'File size exceeds maximum allowed size' } },
          400
        );
      }
      if (error.message.includes('invalid file type')) {
        return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid file type' } }, 400);
      }
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload attachment' } },
      500
    );
  }
});

// DELETE /api/attachments/:id - Delete attachment
attachments.delete('/:id', async (c) => {
  try {
    const _attachmentId = c.req.param('id');
    const _userId = c.get('userId');
    // TODO: Implement service layer
    // await attachmentService.delete(attachmentId, userId);
    return c.json({ data: { message: 'Attachment deleted successfully' } });
  } catch (error) {
    console.error('Delete attachment error:', error);
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return c.json({ error: { code: 'NOT_FOUND', message: 'Attachment not found' } }, 404);
      }
      if (error.message.includes('forbidden')) {
        return c.json(
          { error: { code: 'FORBIDDEN', message: 'You can only delete your own attachments' } },
          403
        );
      }
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete attachment' } },
      500
    );
  }
});

export default attachments;
