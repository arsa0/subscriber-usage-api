import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { resetStore } from '../src/services/usage.service';

const app = createApp();

beforeEach(() => resetStore());

describe('recording usage', () => {
  it('creates a record from valid input', async () => {
    const res = await request(app)
      .post('/usage')
      .send({ "subscriberId": "SUB01", "callMinutes": 40, "smsCount": 10, "dataUsageMB": 1500 });

    expect(res.status).toBe(201);
    expect(res.body.subscriberId).toBe('SUB01');
    expect(res.body.timestamp).toBeDefined();
  });
  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/usage').send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(4);
  });
  it('rejects wrong types', async () => {
    const res = await request(app)
      .post('/usage')
      .send({ "subscriberId": 123, "callMinutes": "minutes", "smsCount": "count", "dataUsageMB": "megabytes" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(4);
  });
  it('rejects negative values', async () => {
    const res = await request(app)
      .post('/usage')
      .send({ "subscriberId": "SUB01", "callMinutes": -40, "smsCount": -10, "dataUsageMB": -1500 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(3);
  });
});

describe('retrieving usage', () => {
  it('returns all records', async () => {
    const res = await request(app)
      .get('/usage')

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });
  it('filters by subscriberId', async () => {
    const res = await request(app)
      .get('/usage?subscriberId=SUB01')

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });
});
