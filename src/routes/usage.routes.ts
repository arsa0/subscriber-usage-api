import { Router } from 'express';

export const usageRouter = Router();

// TODO: design your endpoints, methods, and request/response shapes,
// then document them in README.md. Rename or restructure freely.

usageRouter.post('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

usageRouter.get('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});
