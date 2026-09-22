import express from 'express';
import { usageRouter } from './routes/usage.routes';

// Kept separate from server.ts so tests can import the app
// without opening a port.
export function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/usage', usageRouter);
  return app;
}
