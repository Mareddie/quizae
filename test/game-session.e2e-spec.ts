import { bootstrapApplication } from './testUtils';
import { AuthService } from '../src/Auth/Service/auth.service';
import { PrismaService } from '../src/Common/Service/prisma.service';
import { INestApplication } from '@nestjs/common';
import {
  GameSessionFixture,
  GameSessionFixtureData,
} from './fixtures/game-session.fixture';
import * as request from 'supertest';
import { ObjectID } from 'bson';

describe('Game Session', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fixture: GameSessionFixture;
  let testData: GameSessionFixtureData;
  let authToken: string;

  beforeAll(async () => {
    app = await bootstrapApplication();

    const authService = app.get<AuthService>(AuthService);

    prisma = app.get<PrismaService>(PrismaService);
    fixture = new GameSessionFixture(prisma);

    testData = await fixture.up();
    authToken = await authService.generateToken(testData.user);
  });

  afterAll(async () => {
    await fixture.down();
    await app.close();
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .post(`/game-session/${testData.group.id}/create`)
      .expect(401);

    await request(app.getHttpServer())
      .get(`/game-session/${new ObjectID().toString()}`)
      .expect(401);

    await request(app.getHttpServer())
      .get(
        `/game-session/${new ObjectID().toString()}/get-question/${new ObjectID().toString()}`,
      )
      .expect(401);

    await request(app.getHttpServer())
      .post(`/game-session/${new ObjectID().toString()}/progress`)
      .expect(401);

    await request(app.getHttpServer())
      .post(`/game-session/${new ObjectID().toString()}/finish`)
      .expect(401);
  });

  // TODO: e2e tests for all endpoints
});
