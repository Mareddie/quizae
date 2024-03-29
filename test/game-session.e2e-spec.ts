import { bootstrapApplication } from './testUtils';
import { AuthService } from '../src/Auth/Service/auth.service';
import { PrismaService } from '../src/Common/Service/prisma.service';
import { INestApplication } from '@nestjs/common';
import {
  GameSessionFixture,
  GameSessionFixtureData,
} from './fixtures/game-session.fixture';
import * as request from 'supertest';
import { GameState } from '@prisma/client';
import { CreatedGameWithPlayers } from '../src/GameSession/Type/created-game-with-players';
import { v4 } from 'uuid';

describe('Game Session', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fixture: GameSessionFixture;
  let testData: GameSessionFixtureData;
  let authToken: string;
  let game: CreatedGameWithPlayers;

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
    await request(app.getHttpServer()).post(`/game-session/create`).expect(401);

    await request(app.getHttpServer())
      .get(`/game-session/${v4().toString()}`)
      .expect(401);

    await request(app.getHttpServer())
      .get(`/game-session/${v4().toString()}/get-question/${v4().toString()}`)
      .expect(401);

    await request(app.getHttpServer())
      .post(`/game-session/${v4().toString()}/progress`)
      .expect(401);

    await request(app.getHttpServer())
      .post(`/game-session/${v4().toString()}/finish`)
      .expect(401);
  });

  it('creates Game Session', async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/game-session/create`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send({
        players: [
          {
            name: 'Charlie',
            order: 1,
          },
          {
            name: 'Matt',
            order: 2,
          },
        ],
      });

    expect(createResponse.statusCode).toEqual(201);

    expect(createResponse.body).toMatchObject({
      id: expect.any(String),
      startedById: testData.user.id,
      state: GameState.IN_PROGRESS,
      startedAt: expect.any(String),
      players: expect.any(Array),
    });

    expect(createResponse.body.players).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: 'Charlie',
          points: 0,
          gameId: createResponse.body.id,
          order: 1,
        }),
        expect.objectContaining({
          id: expect.any(String),
          name: 'Matt',
          points: 0,
          gameId: createResponse.body.id,
          order: 2,
        }),
      ]),
    );

    expect(createResponse.body.players.length).toEqual(2);

    const createdGame = await prisma.game.findUnique({
      select: {
        id: true,
        startedById: true,
        state: true,
        startedAt: true,
        currentPlayerId: true,
        nextPlayerId: true,
        players: true,
      },
      where: {
        id: createResponse.body.id,
      },
    });

    // In response, the date is parsed to String - in order to simplify in tests, we can cast it back to Date
    createResponse.body.startedAt = new Date(createResponse.body.startedAt);

    expect(createResponse.body).toMatchObject(createdGame);

    game = createdGame;
  });

  it('fetches Game status', async () => {
    const statusResponse = await request(app.getHttpServer())
      .get(`/game-session/${game.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(statusResponse.statusCode).toEqual(200);

    expect(statusResponse.body).toMatchObject({
      info: {
        id: game.id,
        startedById: testData.user.id,
        state: GameState.IN_PROGRESS,
        startedAt: expect.any(String),
        players: expect.arrayContaining(game.players),
        currentPlayerId: expect.any(String),
        nextPlayerId: expect.any(String),
      },
      categories: [
        {
          id: testData.questionCategory.id,
          name: testData.questionCategory.name,
          priority: testData.questionCategory.priority,
          _count: {
            questions: 2,
          },
        },
      ],
    });
  });

  it('fetches Game Question', async () => {
    const questionResponse = await request(app.getHttpServer())
      .get(
        `/game-session/${game.id}/get-question/${testData.questionCategory.id}`,
      )
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(questionResponse.statusCode).toEqual(200);

    // The question can be totally random, but the response structure should be the same
    expect(questionResponse.body).toMatchObject({
      id: expect.any(String),
      answers: expect.any(Array),
      text: expect.any(String),
    });
  });

  it('progresses the Game - 1st question answer', async () => {
    const correctAnswerId = testData.questionsWithAnswers[0].answers.filter(
      (answer) => answer.isCorrect === true,
    )[0].id;

    const progressResponse = await request(app.getHttpServer())
      .post(`/game-session/${game.id}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send({
        questionId: testData.questionsWithAnswers[0].id,
        answerId: correctAnswerId,
        playerId: game.currentPlayerId,
      });

    expect(progressResponse.statusCode).toEqual(201);

    expect(progressResponse.body).toMatchObject({
      answeredCorrectly: true,
      correctAnswerId: correctAnswerId,
    });

    const statusResponse = await request(app.getHttpServer())
      .get(`/game-session/${game.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(statusResponse.statusCode).toEqual(200);

    expect(statusResponse.body.info).toEqual(
      expect.objectContaining({
        currentPlayerId: game.players.filter((player) => player.order === 2)[0]
          .id,
        nextPlayerId: game.players.filter((player) => player.order === 1)[0].id,
      }),
    );

    const firstPlayerFromStatus = statusResponse.body.info.players.filter(
      (player) => player.order === 1,
    )[0];

    const actualFirstPlayer = game.players.filter(
      (player) => player.order === 1,
    )[0];

    expect(firstPlayerFromStatus).toMatchObject({
      id: actualFirstPlayer.id,
      name: actualFirstPlayer.name,
      points: 10,
    });

    expect(statusResponse.body.categories[0]).toMatchObject({
      id: testData.questionCategory.id,
      name: testData.questionCategory.name,
      priority: testData.questionCategory.priority,
      _count: {
        questions: 1,
      },
    });
  });

  it('progresses the Game - 2nd question answer', async () => {
    const secondPlayer = game.players.filter((player) => player.order === 2)[0];

    const progressResponse = await request(app.getHttpServer())
      .post(`/game-session/${game.id}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send({
        categoryId: testData.questionCategory.id,
        questionId: testData.questionsWithAnswers[1].id,
        answerId: testData.questionsWithAnswers[1].answers.filter(
          (answer) => answer.isCorrect === false,
        )[0].id,
        playerId: secondPlayer.id,
      });

    expect(progressResponse.statusCode).toEqual(201);

    expect(progressResponse.body).toMatchObject({
      answeredCorrectly: false,
      correctAnswerId: testData.questionsWithAnswers[1].answers.filter(
        (answer) => answer.isCorrect === true,
      )[0].id,
    });

    const statusResponse = await request(app.getHttpServer())
      .get(`/game-session/${game.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(statusResponse.statusCode).toEqual(200);

    expect(statusResponse.body.info).toEqual(
      expect.objectContaining({
        currentPlayerId: game.players.filter((player) => player.order === 1)[0]
          .id,
        nextPlayerId: game.players.filter((player) => player.order === 2)[0].id,
      }),
    );

    const secondPlayerFromStatus = statusResponse.body.info.players.filter(
      (player) => player.order === 2,
    )[0];

    expect(secondPlayerFromStatus).toMatchObject({
      id: secondPlayer.id,
      name: secondPlayer.name,
      points: 0,
    });

    expect(statusResponse.body.categories[0]).toMatchObject({
      id: testData.questionCategory.id,
      name: testData.questionCategory.name,
      priority: testData.questionCategory.priority,
      _count: {
        questions: 0,
      },
    });
  });

  it('finalizes the Game', async () => {
    const endGameResponse = await request(app.getHttpServer())
      .post(`/game-session/${game.id}/finish`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(endGameResponse.statusCode).toEqual(201);

    expect(endGameResponse.body).toMatchObject({
      id: game.id,
      state: GameState.FINISHED,
      players: expect.any(Array),
    });

    expect(endGameResponse.body.players).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Charlie',
          points: 10,
        }),
        expect.objectContaining({
          name: 'Matt',
          points: 0,
        }),
      ]),
    );
  });
});
