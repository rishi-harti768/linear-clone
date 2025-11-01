# API Backend

Hono.js backend for Linear Clone.

## Development

```bash
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

## Architecture

- `/src/routes` - HTTP route handlers
- `/src/services` - Business logic
- `/src/middleware` - Auth, CORS, error handling
- `/src/types` - TypeScript types
- `/src/utils` - Helper functions
- `/src/config` - Configuration files
