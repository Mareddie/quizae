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
    authToken = await authService.generateToken(testData.user);
  });

  afterAll(async () => {
    await fixture.down();
    await app.close();
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get(`/question-categories`).expect(401);

    await request(app.getHttpServer())
      .post(`/question-categories/create`)
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/question-categories/${testData.questionCategory.id}`)
      .expect(401);

    await request(app.getHttpServer())
      .delete(`/question-categories/${testData.questionCategory.id}`)
      .expect(401);
  });

  it('lists question categories', async () => {
    const listResponse = await request(app.getHttpServer())
      .get(`/question-categories`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(listResponse.statusCode).toEqual(200);
    expect(listResponse.headers['content-type']).toMatch(/json/);

    expect(listResponse.body).toBeInstanceOf(Array);
    expect(listResponse.body[0]).toMatchObject(testData.questionCategory);
  });

  it('creates question category', async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/question-categories/create`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send({ name: 'Created Question Category', priority: 3 });

    expect(createResponse.statusCode).toEqual(201);
    expect(createResponse.headers['content-type']).toMatch(/json/);

    expect(createResponse.body).toMatchObject({
      id: expect.any(String),
      name: 'Created Question Category',
      priority: 3,
    });

    const createdQuestionCategory = await prisma.questionCategory.findUnique({
      where: {
        id: createResponse.body.id,
      },
    });

    expect(createdQuestionCategory).toMatchObject({
      id: createResponse.body.id,
      name: createResponse.body.name,
      priority: createResponse.body.priority,
    });
  });

  it('updates question category', async () => {
    const updateResponse = await request(app.getHttpServer())
      .patch(`/question-categories/${testData.questionCategory.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send({ name: 'Updated Question Category', priority: 55 });

    expect(updateResponse.statusCode).toEqual(200);
    expect(updateResponse.headers['content-type']).toMatch(/json/);

    expect(updateResponse.body).toMatchObject({
      id: testData.questionCategory.id,
      name: 'Updated Question Category',
      priority: 55,
    });

    const updatedQuestionCategory = await prisma.questionCategory.findUnique({
      where: {
        id: updateResponse.body.id,
      },
    });

    expect(updatedQuestionCategory).toMatchObject({
      id: updateResponse.body.id,
      name: updateResponse.body.name,
      priority: updateResponse.body.priority,
    });
  });

  it('deletes question category', async () => {
    const deleteResponse = await request(app.getHttpServer())
      .delete(`/question-categories/${testData.questionCategory.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(deleteResponse.statusCode).toEqual(204);

    const deletedQuestionCategory = await prisma.questionCategory.findUnique({
      where: {
        id: testData.questionCategory.id,
      },
    });

    expect(deletedQuestionCategory).toBeNull();
  });
});
