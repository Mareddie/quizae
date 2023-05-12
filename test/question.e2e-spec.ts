import * as request from 'supertest';
import { bootstrapApplication } from './testUtils';
import { AuthService } from '../src/Auth/Service/auth.service';
import { PrismaService } from '../src/Common/Service/prisma.service';
import { INestApplication } from '@nestjs/common';
import { QuestionWithAnswers } from '../src/Quiz/Type/question-with-answers';
import {
  QuestionCategoryFixture,
  QuestionCategoryFixtureData,
} from './fixtures/question-category.fixture';

describe('Questions', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fixture: QuestionCategoryFixture;
  let testData: QuestionCategoryFixtureData;
  let authToken: string;
  let testQuestion: QuestionWithAnswers;

  beforeAll(async () => {
    app = await bootstrapApplication();

    const authService = app.get<AuthService>(AuthService);

    prisma = app.get<PrismaService>(PrismaService);
    fixture = new QuestionCategoryFixture(
      prisma,
      {
        email: 'question@testing.test',
        firstName: 'Question',
        lastName: 'e2e Tester',
        password: 'testing',
      },
      { name: 'Question e2e test' },
    );

    testData = await fixture.up();
    authToken = await authService.generateToken(testData.user);
  });

  afterAll(async () => {
    await fixture.down();
    await app.close();
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .get(`/questions/${testData.questionCategory.id}`)
      .expect(401);

    await request(app.getHttpServer())
      .post(`/questions/${testData.questionCategory.id}/create`)
      .expect(401);

    await request(app.getHttpServer())
      .patch(
        `/questions/${testData.questionCategory.id}/${testData.questionCategory.id}`,
      )
      .expect(401);

    await request(app.getHttpServer())
      .delete(
        `/questions/${testData.questionCategory.id}/${testData.questionCategory.id}`,
      )
      .expect(401);
  });

  it('creates question', async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/questions/${testData.questionCategory.id}/create`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        text: 'Who founded Apple?',
        answers: [
          {
            text: 'Bill Gatsby',
          },
          {
            text: 'Steve Jobs',
            isCorrect: true,
            priority: 10,
          },
          {
            text: 'Steve Harris',
          },
        ],
      });

    expect(createResponse.statusCode).toEqual(201);
    expect(createResponse.headers['content-type']).toMatch(/json/);

    expect(createResponse.body).toMatchObject({
      id: expect.any(String),
      categoryId: testData.questionCategory.id,
      text: 'Who founded Apple?',
      answers: expect.any(Array),
    });

    expect(createResponse.body.answers.length).toEqual(3);

    expect(createResponse.body.answers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          questionId: createResponse.body.id,
          text: 'Bill Gatsby',
          isCorrect: false,
          priority: null,
        }),
        expect.objectContaining({
          id: expect.any(String),
          questionId: createResponse.body.id,
          text: 'Steve Jobs',
          isCorrect: true,
          priority: 10,
        }),
        expect.objectContaining({
          id: expect.any(String),
          questionId: createResponse.body.id,
          text: 'Steve Harris',
          isCorrect: false,
          priority: null,
        }),
      ]),
    );

    testQuestion = await prisma.question.findUnique({
      include: {
        answers: true,
      },
      where: {
        id: createResponse.body.id,
      },
    });

    expect(testQuestion).toMatchObject(createResponse.body);
  });

  it('lists questions', async () => {
    const listResponse = await request(app.getHttpServer())
      .get(`/questions/${testData.questionCategory.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${authToken}`);

    expect(listResponse.statusCode).toEqual(200);
    expect(listResponse.headers['content-type']).toMatch(/json/);

    expect(listResponse.body).toBeInstanceOf(Array);
    expect(listResponse.body.length).toEqual(1);
    expect(listResponse.body[0]).toMatchObject(testQuestion);
  });

  it('updates question', async () => {
    const updateResponse = await request(app.getHttpServer())
      .patch(`/questions/${testData.questionCategory.id}/${testQuestion.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        text: 'Who founded Apple?',
        answers: [
          {
            text: 'Harry Potter',
          },
          {
            text: 'Steve Jobs',
            isCorrect: true,
          },
          {
            text: 'Dumbledore',
          },
        ],
      });

    expect(updateResponse.statusCode).toEqual(200);
    expect(updateResponse.headers['content-type']).toMatch(/json/);

    expect(updateResponse.body).toMatchObject({
      id: expect.any(String),
      categoryId: testData.questionCategory.id,
      text: 'Who founded Apple?',
      answers: expect.any(Array),
    });

    expect(updateResponse.body.answers.length).toEqual(3);

    expect(updateResponse.body.answers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          questionId: updateResponse.body.id,
          text: 'Harry Potter',
          isCorrect: false,
          priority: null,
        }),
        expect.objectContaining({
          id: expect.any(String),
          questionId: updateResponse.body.id,
          text: 'Steve Jobs',
          isCorrect: true,
          priority: null,
        }),
        expect.objectContaining({
          id: expect.any(String),
          questionId: updateResponse.body.id,
          text: 'Dumbledore',
          isCorrect: false,
          priority: null,
        }),
      ]),
    );

    testQuestion = await prisma.question.findUnique({
      include: {
        answers: true,
      },
      where: {
        id: updateResponse.body.id,
      },
    });

    expect(testQuestion).toMatchObject(updateResponse.body);
  });

  it('deletes question', async () => {
    const deleteResponse = await request(app.getHttpServer())
      .delete(`/questions/${testData.questionCategory.id}/${testQuestion.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteResponse.statusCode).toEqual(204);

    const deletedQuestion = await prisma.question.findUnique({
      where: {
        id: testQuestion.id,
      },
    });

    expect(deletedQuestion).toBeNull();
  });
});
