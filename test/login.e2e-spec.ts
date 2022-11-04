import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from './testUtils';
describe('Login', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootstrapApplication();
  });

  afterAll(async () => {
    await app.close();
  });

  it('fetches JWT token', async () => {
    const response = await request(app.getHttpServer())
      .post('/login')
      .set('Origin', 'testorigin')
      .set('Accept', 'application/json')
      .send({ email: 'tester@runner.test', password: 'testing' });

    expect(response.statusCode).toEqual(201);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
    });
  });
});
