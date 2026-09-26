import express from 'express';
import { usageRouter } from './routes/usage.routes';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/usage', usageRouter);
  return app;
}
