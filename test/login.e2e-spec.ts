import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
describe('Login', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
