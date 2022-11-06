import * as request from 'supertest';
import { bootstrapApplication } from './testUtils';
import { AuthService } from '../src/Auth/Service/auth.service';
import { PrismaService } from '../src/Common/Service/prisma.service';
import { INestApplication } from '@nestjs/common';
import {
  QuestionCategoryFixture,
  QuestionCategoryFixtureData,
} from './fixtures/question-category.fixture';

describe('Question Categories', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fixture: QuestionCategoryFixture;
  let testData: QuestionCategoryFixtureData;
  let authToken: string;

  beforeAll(async () => {
    app = await bootstrapApplication();

    const authService = app.get<AuthService>(AuthService);

    prisma = app.get<PrismaService>(PrismaService);
    fixture = new QuestionCategoryFixture(prisma);

    testData = await fixture.up();
    authToken = await authService.generateToken(testData.firstUser);
  });

  afterAll(async () => {
    await fixture.down();
    await app.close();
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .get(`/question-categories/${testData.group.id}`)
      .expect(401);
  });

  // TODO: implement tests
});
