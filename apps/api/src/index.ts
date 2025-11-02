import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import 'dotenv/config';
import activityRoutes from './routes/activity';
import attachmentRoutes from './routes/attachments';
import authRoutes from './routes/auth';
import commentRoutes from './routes/comments';
import cycleRoutes from './routes/cycles';
import issueRoutes from './routes/issues';
import labelRoutes from './routes/labels';
import notificationRoutes from './routes/notifications';
import projectRoutes from './routes/projects';
import searchRoutes from './routes/search';
import teamRoutes from './routes/teams';
import workspaceRoutes from './routes/workspaces';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/v1', (c) => {
  return c.json({
    message: 'Linear Clone API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      workspaces: '/api/v1/workspaces',
      teams: '/api/v1/teams',
      issues: '/api/v1/issues',
      projects: '/api/v1/projects',
      cycles: '/api/v1/cycles',
      labels: '/api/v1/labels',
      comments: '/api/v1/comments',
      attachments: '/api/v1/attachments',
      notifications: '/api/v1/notifications',
      search: '/api/v1/search',
      activity: '/api/v1/activity',
    },
  });
});

// Auth routes
app.route('/api/v1/auth', authRoutes);

// Workspace routes
app.route('/api/v1/workspaces', workspaceRoutes);

// Team routes
app.route('/api/v1', teamRoutes);

// Issue routes
app.route('/api/v1', issueRoutes);

// Project routes
app.route('/api/v1', projectRoutes);

// Cycle routes
app.route('/api/v1', cycleRoutes);

// Label routes
app.route('/api/v1', labelRoutes);

// Comment routes
app.route('/api/v1/comments', commentRoutes);

// Attachment routes
app.route('/api/v1/attachments', attachmentRoutes);

// Notification routes
app.route('/api/v1/notifications', notificationRoutes);

// Search routes
app.route('/api/v1/search', searchRoutes);

// Activity routes
app.route('/api/v1/activity', activityRoutes);

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
