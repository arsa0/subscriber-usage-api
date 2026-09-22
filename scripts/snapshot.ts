// Q2: calls the retrieval endpoint 3 times a day (08:00, 12:00, 15:00 WIB)
// and saves each response as a CSV file in ./snapshots.
//
// TODO:
//   - schedule with node-cron (mind the server timezone vs WIB)
//   - fetch records from the API (Node 20+ has global fetch)
//   - convert records to CSV (escape commas and quotes)
//   - write using your chosen file naming convention (document it)
//   - handle and log failures: API unreachable, bad response, write error

export {};
