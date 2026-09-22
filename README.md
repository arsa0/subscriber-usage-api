# subscriber-usage-api

A backend service for recording and retrieving subscriber usage, with scheduled snapshot automation.

## Requirements

- Node.js 20+
- npm

## Setup

```bash
npm install
```

## Running the API

```bash
npm run dev      # development, with reload
npm run build    # compile TypeScript
npm start        # run compiled build
```

The API listens on `http://localhost:3000` by default. Override with `PORT`.

Storage is in-memory: records are lost when the process restarts.

## API

TODO: document each endpoint — method, path, request body, response shape, status codes, and an example.

## Automation

### Snapshot job

```bash
npm run snapshot
```

TODO: schedule, timezone handling, output location.

### File naming convention

TODO: describe the convention and why you chose it.

### Cleanup

```bash
npm run cleanup
```

TODO: how file age is determined, and why.

## SQL

See [`sql/schema.sql`](sql/schema.sql) for setup and [`sql/queries.sql`](sql/queries.sql) for the queries.

TODO: which database, and how to run them.

## Q4 — Troubleshooting

See [`q4/EXPLANATION.md`](q4/EXPLANATION.md).

## Testing

```bash
npm test
npm run lint
npm run typecheck
```

## Project structure

```
src/
  app.ts                  Express app (importable by tests)
  server.ts               Entry point
  types.ts                Shared types
  routes/                 HTTP routes
  services/               In-memory storage and business logic
  validation/             Request validation
scripts/
  snapshot.ts             Q2 scheduled snapshot job
  cleanup.ts              Q2 old-snapshot removal
sql/
  schema.sql              Q3 tables and seed data
  queries.sql             Q3 queries
q4/
  getTotalUsageMB.ts      Q4 fixed function
  EXPLANATION.md          Q4 write-up
tests/                    Vitest suites
snapshots/                CSV output (gitignored)
```
