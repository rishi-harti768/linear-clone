import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import {
  type GlobalSearchInput,
  type IssueSearchInput,
  globalSearchSchema,
  issueSearchSchema,
} from '../schemas/search.schema';

type AuthVariables = { userId: string; userEmail: string };
const search = new Hono<{ Variables: AuthVariables }>();
search.use('*', authMiddleware);

// GET /api/search - Global search
search.get('/', async (c) => {
  try {
    const _userId = c.get('userId');
    const query = c.req.query();
    const validated: GlobalSearchInput = globalSearchSchema.parse({
      q: query.q,
      type: query.type || 'all',
      limit: query.limit ? Number.parseInt(query.limit) : 20,
    });
    // TODO: Implement service layer
    // const results = await searchService.globalSearch(validated, userId);
    return c.json({
      data: { results: { issues: [], projects: [], users: [] }, query: validated.q },
    });
  } catch (error) {
    console.error('Global search error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search query',
            details: process.env.NODE_ENV === 'development' ? error : undefined,
          },
        },
        422
      );
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to perform search' } },
      500
    );
  }
});

// GET /api/search/issues - Search issues with filters
search.get('/issues', async (c) => {
  try {
    const _userId = c.get('userId');
    const query = c.req.query();
    const validated: IssueSearchInput = issueSearchSchema.parse({
      q: query.q,
      teamId: query.teamId,
      status: query.status,
      priority: query.priority,
      assigneeId: query.assigneeId,
      limit: query.limit ? Number.parseInt(query.limit) : 50,
    });
    // TODO: Implement service layer
    // const results = await searchService.searchIssues(validated, userId);
    return c.json({ data: { issues: [], query: validated.q } });
  } catch (error) {
    console.error('Issue search error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: process.env.NODE_ENV === 'development' ? error : undefined,
          },
        },
        422
      );
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to search issues' } },
      500
    );
  }
});

export default search;
