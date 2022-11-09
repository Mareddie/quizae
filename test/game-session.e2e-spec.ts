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
import { GameState } from '@prisma/client';
import { CreatedGameWithPlayers } from '../src/GameSession/Type/created-game-with-players';
import { GameStatus } from '../src/GameSession/Type/game-status';

describe('Game Session', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fixture: GameSessionFixture;
  let testData: GameSessionFixtureData;
  let authToken: string;
  let game: CreatedGameWithPlayers;
  let gameStatus: GameStatus;

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

  it('creates Game Session', async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/game-session/${testData.group.id}/create`)
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
      id: game.id,
      startedById: testData.user.id,
      state: GameState.IN_PROGRESS,
      currentPlayerId: game.players[0].id,
      nextPlayerId: game.players[1].id,
      players: game.players,
      categoryStatuses: expect.any(Array),
      startedAt: expect.any(String),
    });

    expect(statusResponse.body.categoryStatuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: 'Games',
          order: 1,
          questionCount: 2,
        }),
      ]),
    );

    gameStatus = statusResponse.body;
  });

  it('fetches Game Question', async () => {
    const questionResponse = await request(app.getHttpServer())
      .get(
        `/game-session/${gameStatus.id}/get-question/${gameStatus.categoryStatuses[0].id}`,
      )
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(questionResponse.statusCode).toEqual(200);

    // The question can be totally random, but the response structure should be the same
    expect(questionResponse.body).toMatchObject({
      id: expect.any(String),
      categoryId: gameStatus.categoryStatuses[0].id,
      answers: expect.any(Array),
      text: expect.any(String),
    });
  });

  it('progresses the Game - 1st question answer', async () => {
    const progressResponse = await request(app.getHttpServer())
      .post(`/game-session/${gameStatus.id}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send({
        categoryId: testData.questionCategory.id,
        questionId: testData.questions[0].id,
        answerId: testData.questions[0].correctAnswer,
        playerId: gameStatus.players[0].id,
      });

    expect(progressResponse.statusCode).toEqual(201);

    expect(progressResponse.body).toMatchObject({
      answeredCorrectly: true,
      correctAnswerId: testData.questions[0].correctAnswer,
    });

    const statusResponse = await request(app.getHttpServer())
      .get(`/game-session/${gameStatus.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(statusResponse.statusCode).toEqual(200);

    expect(statusResponse.body).toMatchObject({
      currentPlayerId: gameStatus.players[1].id,
      nextPlayerId: gameStatus.players[0].id,
    });

    expect(statusResponse.body.players[0]).toMatchObject({
      id: gameStatus.players[0].id,
      name: gameStatus.players[0].name,
      points: 10,
    });

    expect(statusResponse.body.players[1]).toMatchObject({
      id: gameStatus.players[1].id,
      name: gameStatus.players[1].name,
      points: 0,
    });

    expect(statusResponse.body.categoryStatuses[0]).toMatchObject({
      id: testData.questionCategory.id,
      name: testData.questionCategory.name,
      order: testData.questionCategory.order,
      questionCount: 1,
    });
  });

  it('progresses the Game - 2nd question answer', async () => {
    const answer = await prisma.answer.findFirst({
      where: {
        questionId: testData.questions[1].id,
        NOT: {
          id: testData.questions[1].correctAnswer,
        },
      },
    });

    const progressResponse = await request(app.getHttpServer())
      .post(`/game-session/${gameStatus.id}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send({
        categoryId: testData.questionCategory.id,
        questionId: testData.questions[1].id,
        answerId: answer.id,
        playerId: gameStatus.players[1].id,
      });

    expect(progressResponse.statusCode).toEqual(201);

    expect(progressResponse.body).toMatchObject({
      answeredCorrectly: false,
      correctAnswerId: testData.questions[1].correctAnswer,
    });

    const statusResponse = await request(app.getHttpServer())
      .get(`/game-session/${gameStatus.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(statusResponse.statusCode).toEqual(200);

    expect(statusResponse.body).toMatchObject({
      currentPlayerId: gameStatus.players[0].id,
      nextPlayerId: gameStatus.players[1].id,
    });

    expect(statusResponse.body.players[0]).toMatchObject({
      id: gameStatus.players[0].id,
      name: gameStatus.players[0].name,
      points: 10,
    });

    expect(statusResponse.body.players[1]).toMatchObject({
      id: gameStatus.players[1].id,
      name: gameStatus.players[1].name,
      points: 0,
    });

    expect(statusResponse.body.categoryStatuses.length).toEqual(0);
  });

  it('finalizes the Game', async () => {
    const endGameResponse = await request(app.getHttpServer())
      .post(`/game-session/${gameStatus.id}/finish`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(endGameResponse.statusCode).toEqual(201);

    expect(endGameResponse.body).toMatchObject({
      id: gameStatus.id,
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
