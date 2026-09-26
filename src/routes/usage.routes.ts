import { Router } from 'express';
import { validateUsage } from '../validation/usage.validation';
import { createUsage, listUsage } from '../services/usage.service';

export const usageRouter = Router();

usageRouter.post('/', (req, res) => {
  const result = validateUsage(req.body);

  if (!result.ok) return res.status(400).json({ errors: result.errors });

  const record = createUsage(result.value);
  res.status(201).json(record);
});

usageRouter.get('/', (req, res) => {
  const { subscriberId } = req.query;

  const records = typeof subscriberId === 'string' ? listUsage({ subscriberId }) : listUsage();

  res.status(200).json(records);
});