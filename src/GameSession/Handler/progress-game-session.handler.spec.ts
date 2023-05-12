import { ProgressGameSessionHandler } from './progress-game-session.handler';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { ReorderService } from '../../Common/Service/reorder.service';
import { GameState } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { ProgressGameRequestDTO } from '../DTO/progress-game-request.dto';
import { ConflictException } from '@nestjs/common';
import { QuestionForGameProgress } from '../../Quiz/Type/question-with-answers';

describe('ProgressGameSessionHandler', () => {
  let handler: ProgressGameSessionHandler;

  const baseGameData = {
    state: GameState.IN_PROGRESS,
    categories: [
      {
        id: '999',
        name: 'Some Category',
        priority: 1,
        _count: {
          questions: 2,
        },
      },
    ],
  };

  const gameDataWithThreePlayers = {
    ...baseGameData,
    currentPlayerId: '123',
    nextPlayerId: '456',
    players: [
      {
        id: '123',
        name: 'Charlie',
        points: 0,
        order: 1,
      },
      {
        id: '456',
        name: 'Eduard',
        points: 0,
        order: 2,
      },
      {
        id: '789',
        name: 'Dave',
        points: 0,
        order: 3,
      },
    ],
  };

  const questionForGameProgress: QuestionForGameProgress = {
    id: '123',
    text: 'Some Question',
    answers: [
      {
        id: '111',
        text: 'Incorrect',
        isCorrect: false,
      },
      {
        id: '222',
        text: 'Correct',
        isCorrect: true,
      },
    ],
  };

  const repositoryMock = {
    endGame: jest.fn().mockResolvedValue('test'),
    fetchById: jest
      .fn()
      .mockResolvedValue(JSON.parse(JSON.stringify(gameDataWithThreePlayers))),
    updateGameDataAfterProgress: jest.fn().mockResolvedValue('test'),
    saveGameProgress: jest.fn().mockResolvedValue('test'),
  };

  beforeEach(() => {
    handler = new ProgressGameSessionHandler(
      repositoryMock as unknown as GameSessionRepository,
      new ReorderService(),
    );
  });

  describe('endGame', () => {
    it('ends game', async () => {
      const result = await handler.endGame('123');

      expect(result).toEqual('test');

      expect(repositoryMock['endGame']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['endGame']).toHaveBeenCalledWith('123');
    });
  });

  describe('progressGame', () => {
    it('prohibits to play finished game', async () => {
      repositoryMock['fetchById'].mockResolvedValueOnce({
        state: GameState.FINISHED,
      });

      const dto = plainToClass(ProgressGameRequestDTO, {
        questionId: '123',
        answerId: '123',
        playerId: '123',
      });

      await expect(
        handler.progressGame(questionForGameProgress, dto, '111'),
      ).rejects.toThrow(ConflictException);
    });

    it('prohibits to play players outside their turn', async () => {
      repositoryMock['fetchById'].mockResolvedValueOnce({
        state: GameState.IN_PROGRESS,
        currentPlayerId: '456',
      });

      const dto = plainToClass(ProgressGameRequestDTO, {
        questionId: '123',
        answerId: '123',
        playerId: '123',
      });

      await expect(
        handler.progressGame(questionForGameProgress, dto, '111'),
      ).rejects.toThrow(ConflictException);
    });

    it('throws an exception on undefined player', async () => {
      repositoryMock['fetchById'].mockResolvedValueOnce({
        state: GameState.IN_PROGRESS,
        currentPlayerId: '123',
        players: [],
      });

      const dto = plainToClass(ProgressGameRequestDTO, {
        questionId: '123',
        answerId: '123',
        playerId: '123',
      });

      await expect(
        handler.progressGame(questionForGameProgress, dto, '111'),
      ).rejects.toThrow(ConflictException);
    });

    it('processes incorrect answer', async () => {
      repositoryMock['fetchById'].mockResolvedValueOnce(
        JSON.parse(JSON.stringify(gameDataWithThreePlayers)),
      );

      const dto = plainToClass(ProgressGameRequestDTO, {
        questionId: '1',
        answerId: '111',
        playerId: '123',
      });

      const result = await handler.progressGame(
        questionForGameProgress,
        dto,
        '111',
      );

      expect(repositoryMock['saveGameProgress']).toHaveBeenCalledTimes(1);

      expect(repositoryMock['saveGameProgress']).toHaveBeenCalledWith(
        '111',
        dto,
        questionForGameProgress,
        false,
      );

      expect(
        repositoryMock['updateGameDataAfterProgress'],
      ).toHaveBeenCalledTimes(1);

      expect(
        repositoryMock['updateGameDataAfterProgress'],
      ).toHaveBeenCalledWith(expect.any(Object), {
        id: '123',
        name: 'Charlie',
        points: 0,
        order: 1,
      });

      expect(result).toMatchObject({
        answeredCorrectly: false,
        correctAnswerId: '222',
      });
    });

    it('processes correct answer', async () => {
      repositoryMock['fetchById'].mockResolvedValueOnce(
        JSON.parse(JSON.stringify(gameDataWithThreePlayers)),
      );

      const dto = plainToClass(ProgressGameRequestDTO, {
        questionId: '1',
        answerId: '222',
        playerId: '123',
      });

      const result = await handler.progressGame(
        questionForGameProgress,
        dto,
        '111',
      );

      expect(repositoryMock['saveGameProgress']).toHaveBeenCalledTimes(2);

      expect(repositoryMock['saveGameProgress']).toHaveBeenCalledWith(
        '111',
        dto,
        questionForGameProgress,
        true,
      );

      expect(
        repositoryMock['updateGameDataAfterProgress'],
      ).toHaveBeenCalledTimes(2);

      expect(
        repositoryMock['updateGameDataAfterProgress'],
      ).toHaveBeenCalledWith(expect.any(Object), {
        id: '123',
        name: 'Charlie',
        points: 10,
        order: 1,
      });

      expect(result).toMatchObject({
        answeredCorrectly: true,
        correctAnswerId: '222',
      });
    });
  });
});
