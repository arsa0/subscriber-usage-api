# subscriber-usage-api

A backend service for recording and retrieving subscriber usage, with scheduled snapshot
automation and SQL reporting queries.

## Requirements

- Node.js 20+
- npm
- PostgreSQL (for the SQL section only)

## Setup

```bash
npm install
```

## Quick start

The order matters. Storage is in-memory, so the API must be running and hold data before a
snapshot will produce anything useful.

```bash
# 1. Start the API
npm run dev

# 2. In a second terminal, record some usage
curl -X POST http://localhost:3000/usage \
  -H "Content-Type: application/json" \
  -d '{"subscriberId":"SUB01","callMinutes":40,"smsCount":10,"dataUsageMB":1500}'

# 3. Take a snapshot immediately
npm run snapshot:once
```

---

## API

Base URL: `http://localhost:3000`. Override the port with the `PORT` environment variable.

Storage is in-memory, records are lost when the process restarts.

### `POST /usage`

Records a usage entry. The server attaches the timestamp; clients do not supply it.

**Request**

```json
{
  "subscriberId": "SUB01",
  "callMinutes": 40,
  "smsCount": 10,
  "dataUsageMB": 1500
}
```

All four fields are required. The brief does not state which fields are optional, and a usage
record with a missing metric is ambiguous, it cannot be distinguished from zero usage. The
three numeric fields must be non-negative.

**Response, `201 Created`**

```json
{
  "subscriberId": "SUB01",
  "callMinutes": 40,
  "smsCount": 10,
  "dataUsageMB": 1500,
  "timestamp": "2026-09-26T08:47:00.000Z"
}
```

**Response, `400 Bad Request`**

All validation failures are collected and returned together, so a client does not have to
resubmit repeatedly to discover every problem.

```json
{
  "errors": [
    "subscriberId is required and must be a non-empty string",
    "callMinutes is required and must be a non-negative number"
  ]
}
```

### `GET /usage`

Returns all recorded usage. Optionally filtered by subscriber.

```bash
curl http://localhost:3000/usage
curl "http://localhost:3000/usage?subscriberId=SUB01"
```

**Response, `200 OK`**

Always an array. A filter matching nothing returns `[]` with status 200 rather than 404, an
empty collection is a valid result, whereas 404 would mean the endpoint itself does not exist.

---

## Automation

### Snapshot job

```bash
npm run snapshot        # schedules 08:00, 12:00, 15:00 WIB; stays running
npm run snapshot:once   # runs once immediately, then exits
```

The scheduled mode keeps the process alive, that is expected, not a hang. Stop it with Ctrl+C.

The `--once` mode exists because the schedule fires only three times a day, which is impractical
to wait for during review.

The job calls the API's own `GET /usage` endpoint over HTTP rather than reading the store
directly, since it runs as a separate process. **The API must be running**, or the snapshot
fails with a logged error and writes nothing.

Output goes to `./snapshots`, resolved relative to the script's own location so it works
regardless of the working directory.

**Timezone.** The cron schedule is pinned to `Asia/Jakarta` explicitly rather than relying on the
host timezone, since a server running in UTC would otherwise fire at the wrong hours. Note that
the filename uses the machine's local time, on a UTC host, the schedule and the filename would
disagree by seven hours.

### File naming convention

```
usage_2026-09-26_08-47-00.csv
```

`usage_` prefix, then `YYYY-MM-DD`, then `HH-mm-ss`.

- **`YYYY-MM-DD` rather than `DD-MM-YY`** so that alphabetical order matches chronological
  order. This is what lets the cleanup script determine age from the filename.
- **Hyphens rather than colons** in the time. Windows does not permit `:` in filenames, and
  `toISOString()` output would fail there.
- **Seconds included** so that two manual runs within the same minute produce separate files
  rather than silently overwriting.
- **`usage_` prefix** so the cleanup script can distinguish snapshots from anything else in the
  directory.

### Cleanup

```bash
npm run cleanup
```

Removes snapshots older than 30 days. Runs once and exits, the brief asks for a script, not a
schedule. In production this would be triggered by an external scheduler rather than built into
the application.

**File age is taken from the filename, not `mtime`.** The filename records when the snapshot was
taken. `mtime` records the file's current state on disk, and is reset by copying, moving, or
restoring the directory, so a snapshot archive copied to another machine would appear to be
brand new and never get cleaned up.

Files that do not match the naming pattern are skipped, not deleted. A cleanup script that
removes files it does not understand is dangerous.

The script reports what it did even when nothing was removed, so an empty result is
distinguishable from a failed run.

---

## SQL

PostgreSQL 17, run via Docker. Run `schema.sql` first, then `queries.sql`.

```bash
docker run --name pmt-postgres -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:17

docker exec -i pmt-postgres psql -U postgres < sql/schema.sql
docker exec -i pmt-postgres psql -U postgres < sql/queries.sql
```

Any PostgreSQL instance works, the container is simply how it was run here.

`schema.sql` creates the `subscribers` and `usage` tables and loads the reference data from the
brief. Activation dates are converted from the brief's display format (`12-Jan-23`) to ISO
(`2023-01-12`).

`queries.sql` contains the five required queries with their results recorded as comments.

**Run `queries.sql` only once.** Queries 1 and 2 modify data, re-running will fail on the
duplicate insert.

Note that query 1 assigns Fajar the id `SUB07`. The brief does not specify an id, and the column
is not auto-generated, so this follows the existing pattern.

---

## Q4, Troubleshoot & Explain

See [`q4/EXPLANATION.md`](q4/EXPLANATION.md).

---

## Frontend

<!-- TODO: fill this in.
     - how to install and run it (cd client && npm install && npm run dev)
     - which port it runs on
     - how it reaches the API (Vite proxy, or direct with CORS)
     - what it does: form to record usage, table to view, filter
     - which states you handled: loading, empty, error, validation messages
     Keep it to a short paragraph plus the commands. -->

---

## Testing

```bash
npm test         # Vitest
npm run lint     # ESLint
npm run typecheck
```

The lint config includes `array-callback-return`, added as part of the Q4 answer, it is the
rule that catches the class of bug described there.

---

## Design notes

Decisions taken where the brief left room, and things deliberately left out.

- **In-memory storage**, as the brief permits. All data access goes through
  `src/services/usage.service.ts`, so it could be replaced with a database-backed
  implementation without changing the routes.
- **No per-record id.** The record shape in the brief does not include one, and no endpoint
  retrieves a single record. An id would be needed if records became individually addressable
  or updatable.
- **Unknown fields are ignored.** Only the four documented fields are read from the request
  body, via destructuring. Extra fields are never stored, which prevents mass assignment.
- **Records are frozen** on creation, and `listUsage` returns a copy of the array, so the
  internal store cannot be mutated by callers. The freeze is shallow, which is sufficient for a
  flat record.
- **No authentication, pagination, or rate limiting.** None are required by the brief, and the
  dataset is small.

---

## Project structure

```
src/
  app.ts                  Express app (separate from server.ts so tests can import it)
  server.ts              Entry point
  types.ts               Shared types
  routes/                HTTP routes
  services/              In-memory store and business logic
  validation/            Request validation
scripts/
  snapshot.ts            Q2 scheduled snapshot job
  cleanup.ts             Q2 old-snapshot removal
sql/
  schema.sql             Q3 tables and seed data
  queries.sql            Q3 queries
q4/
  getTotalUsageMB.ts     Q4 fixed function
  EXPLANATION.md         Q4 write-up
client/                  Frontend
tests/                   Vitest suites
snapshots/               CSV output (gitignored)
```