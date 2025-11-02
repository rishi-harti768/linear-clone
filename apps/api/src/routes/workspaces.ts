import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import {
  type AddWorkspaceMemberInput,
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput,
  addWorkspaceMemberSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from '../schemas/workspace.schema';

/**
 * Workspace Routes
 * Handles workspace CRUD operations and member management
 */

type AuthVariables = {
  userId: string;
  userEmail: string;
};

const workspaces = new Hono<{ Variables: AuthVariables }>();

// All workspace routes require authentication
workspaces.use('*', authMiddleware);

/**
 * GET /api/workspaces
 * List user's workspaces
 */
workspaces.get('/', async (c) => {
  try {
    const _userId = c.get('userId');

    // TODO: Implement service layer
    // const userWorkspaces = await workspaceService.listUserWorkspaces(userId);

    return c.json({
      data: {
        workspaces: [],
        // workspaces: userWorkspaces,
      },
    });
  } catch (error) {
    console.error('List workspaces error:', error);

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list workspaces',
        },
      },
      500
    );
  }
});

/**
 * POST /api/workspaces
 * Create workspace
 */
workspaces.post('/', async (c) => {
  try {
    const _userId = c.get('userId');
    const body = await c.req.json();

    // Validate input
    const validated: CreateWorkspaceInput = createWorkspaceSchema.parse(body);

    // TODO: Implement service layer
    // const workspace = await workspaceService.createWorkspace(validated, userId);

    return c.json(
      {
        data: {
          workspace: {
            id: 'placeholder',
            ...validated,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      },
      201
    );
  } catch (error) {
    console.error('Create workspace error:', error);

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

      if (error.message.includes('already exists')) {
        return c.json(
          {
            error: {
              code: 'CONFLICT',
              message: error.message,
            },
          },
          409
        );
      }
    }

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create workspace',
        },
      },
      500
    );
  }
});

/**
 * GET /api/workspaces/:id
 * Get workspace details
 */
workspaces.get('/:id', async (c) => {
  try {
    const workspaceId = c.req.param('id');
    const _userId = c.get('userId');

    // TODO: Implement service layer
    // const workspace = await workspaceService.getWorkspace(workspaceId, userId);

    return c.json({
      data: {
        workspace: {
          id: workspaceId,
          name: 'Placeholder Workspace',
          slug: 'placeholder',
          icon: '🏢',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Get workspace error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return c.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Workspace not found',
          },
        },
        404
      );
    }

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get workspace',
        },
      },
      500
    );
  }
});

/**
 * PATCH /api/workspaces/:id
 * Update workspace
 */
workspaces.patch('/:id', async (c) => {
  try {
    const workspaceId = c.req.param('id');
    const _userId = c.get('userId');
    const body = await c.req.json();

    // Validate input
    const validated: UpdateWorkspaceInput = updateWorkspaceSchema.parse(body);

    // TODO: Implement service layer
    // const workspace = await workspaceService.updateWorkspace(workspaceId, validated, userId);

    return c.json({
      data: {
        workspace: {
          id: workspaceId,
          ...validated,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Update workspace error:', error);

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
        return c.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Workspace not found',
            },
          },
          404
        );
      }

      if (error.message.includes('forbidden')) {
        return c.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to update this workspace',
            },
          },
          403
        );
      }
    }

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update workspace',
        },
      },
      500
    );
  }
});

/**
 * DELETE /api/workspaces/:id
 * Delete workspace
 */
workspaces.delete('/:id', async (c) => {
  try {
    const _workspaceId = c.req.param('id');
    const _userId = c.get('userId');

    // TODO: Implement service layer
    // await workspaceService.deleteWorkspace(workspaceId, userId);

    return c.json(
      {
        data: {
          message: 'Workspace deleted successfully',
        },
      },
      200
    );
  } catch (error) {
    console.error('Delete workspace error:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return c.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Workspace not found',
            },
          },
          404
        );
      }

      if (error.message.includes('forbidden')) {
        return c.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'Only workspace owners can delete workspaces',
            },
          },
          403
        );
      }
    }

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete workspace',
        },
      },
      500
    );
  }
});

/**
 * GET /api/workspaces/:id/members
 * List workspace members
 */
workspaces.get('/:id/members', async (c) => {
  try {
    const _workspaceId = c.req.param('id');
    const _userId = c.get('userId');

    // TODO: Implement service layer
    // const members = await workspaceService.listMembers(workspaceId, userId);

    return c.json({
      data: {
        members: [],
      },
    });
  } catch (error) {
    console.error('List workspace members error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return c.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Workspace not found',
          },
        },
        404
      );
    }

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list workspace members',
        },
      },
      500
    );
  }
});

/**
 * POST /api/workspaces/:id/members
 * Add member to workspace
 */
workspaces.post('/:id/members', async (c) => {
  try {
    const workspaceId = c.req.param('id');
    const _userId = c.get('userId');
    const body = await c.req.json();

    // Validate input
    const validated: AddWorkspaceMemberInput = addWorkspaceMemberSchema.parse(body);

    // TODO: Implement service layer
    // const member = await workspaceService.addMember(workspaceId, validated, userId);

    return c.json(
      {
        data: {
          member: {
            id: 'placeholder',
            workspaceId,
            ...validated,
            createdAt: new Date().toISOString(),
          },
        },
      },
      201
    );
  } catch (error) {
    console.error('Add workspace member error:', error);

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
        return c.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Workspace or user not found',
            },
          },
          404
        );
      }

      if (error.message.includes('forbidden')) {
        return c.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to add members',
            },
          },
          403
        );
      }

      if (error.message.includes('already a member')) {
        return c.json(
          {
            error: {
              code: 'CONFLICT',
              message: 'User is already a member of this workspace',
            },
          },
          409
        );
      }
    }

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add workspace member',
        },
      },
      500
    );
  }
});

/**
 * DELETE /api/workspaces/:id/members/:userId
 * Remove member from workspace
 */
workspaces.delete('/:id/members/:userId', async (c) => {
  try {
    const _workspaceId = c.req.param('id');
    const _memberUserId = c.req.param('userId');
    const _currentUserId = c.get('userId');

    // TODO: Implement service layer
    // await workspaceService.removeMember(workspaceId, memberUserId, currentUserId);

    return c.json({
      data: {
        message: 'Member removed successfully',
      },
    });
  } catch (error) {
    console.error('Remove workspace member error:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return c.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Workspace or member not found',
            },
          },
          404
        );
      }

      if (error.message.includes('forbidden')) {
        return c.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to remove members',
            },
          },
          403
        );
      }

      if (error.message.includes('cannot remove owner')) {
        return c.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: 'Cannot remove workspace owner',
            },
          },
          400
        );
      }
    }

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove workspace member',
        },
      },
      500
    );
  }
});

export default workspaces;
