import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/Common/Service/prisma.service';
import * as argon2 from 'argon2';

describe('Login', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const service = await app.resolve<PrismaService>(PrismaService);
    const testPassword = await argon2.hash('testing');

    // Prepare testing user
    await service.user.upsert({
      where: {
        email: 'tester@runner.test',
      },
      update: {
        email: 'tester@runner.test',
        password: testPassword,
        firstName: 'Tester',
        lastName: 'Testerovic',
      },
      create: {
        email: 'tester@runner.test',
        password: testPassword,
        firstName: 'Tester',
        lastName: 'Testerovic',
      },
    });
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
