import { ProgressGameSessionHandler } from './progress-game-session.handler';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { ReorderService } from '../../Common/Service/reorder.service';
import { GameState } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { ProgressGameRequestDTO } from '../DTO/progress-game-request.dto';
import { ConflictException } from '@nestjs/common';

describe('ProgressGameSessionHandler', () => {
  let handler: ProgressGameSessionHandler;

  const baseGameData = {
    state: GameState.IN_PROGRESS,
    questionCategories: [
      {
        id: '999',
        name: 'Some Category',
        order: 1,
        questions: [
          {
            id: '1',
            categoryId: '999',
            correctAnswer: '2',
            text: 'How much is 4x4?',
            answers: [
              {
                id: '3',
                questionId: '1',
                text: 'I do not know',
                order: 1,
              },
              {
                id: '4',
                questionId: '1',
                text: '20',
                order: 2,
              },
              {
                id: '2',
                questionId: '1',
                text: '16',
                order: 3,
              },
              {
                id: '1',
                questionId: '1',
                text: '9',
                order: 4,
              },
            ],
          },
        ],
      },
    ],
  };

  const gameDataWithThreePlayers = {
    ...baseGameData,
    currentPlayerId: '123',
    nextPlayerId: '123',
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

  const gameDataWithTwoPlayers = {
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
        name: 'John',
        points: 0,
        order: 2,
      },
    ],
  };

  const repositoryMock = {
    endGame: jest.fn().mockResolvedValue('test'),
    fetchById: jest
      .fn()
      .mockResolvedValueOnce({
        state: GameState.FINISHED,
      })
      .mockResolvedValueOnce({
        state: GameState.IN_PROGRESS,
        currentPlayerId: '456',
      })
      .mockResolvedValueOnce({
        state: GameState.IN_PROGRESS,
        currentPlayerId: '123',
        players: [],
      })
      .mockResolvedValueOnce(JSON.parse(JSON.stringify(gameDataWithTwoPlayers)))
      .mockResolvedValueOnce(JSON.parse(JSON.stringify(gameDataWithTwoPlayers)))
      .mockResolvedValueOnce(
        JSON.parse(JSON.stringify(gameDataWithThreePlayers)),
      ),
    updateGameDataAfterProgress: jest.fn().mockResolvedValue('test'),
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
      const dto = plainToClass(ProgressGameRequestDTO, {
        categoryId: '123',
        questionId: '123',
        answerId: '123',
        playerId: '123',
      });

      await expect(handler.progressGame(dto, '111')).rejects.toThrow(
        ConflictException,
      );
    });

    it('prohibits to play players outside their turn', async () => {
      const dto = plainToClass(ProgressGameRequestDTO, {
        categoryId: '123',
        questionId: '123',
        answerId: '123',
        playerId: '123',
      });

      await expect(handler.progressGame(dto, '111')).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws an exception on undefined player', async () => {
      const dto = plainToClass(ProgressGameRequestDTO, {
        categoryId: '999',
        questionId: '123',
        answerId: '123',
        playerId: '123',
      });

      await expect(handler.progressGame(dto, '111')).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws an exception on invalid question ID', async () => {
      const dto = plainToClass(ProgressGameRequestDTO, {
        categoryId: '999',
        questionId: '123',
        answerId: '123',
        playerId: '123',
      });

      await expect(handler.progressGame(dto, '111')).rejects.toThrow(
        ConflictException,
      );
    });

    it('processes incorrect answer', async () => {
      const dto = plainToClass(ProgressGameRequestDTO, {
        categoryId: '999',
        questionId: '1',
        answerId: '123',
        playerId: '123',
      });

      const result = await handler.progressGame(dto, '111');

      expect(
        repositoryMock['updateGameDataAfterProgress'],
      ).toHaveBeenCalledTimes(1);

      expect(
        repositoryMock['updateGameDataAfterProgress'],
      ).toHaveBeenCalledWith(
        {
          state: GameState.IN_PROGRESS,
          currentPlayerId: '456',
          nextPlayerId: '123',
          questionCategories: [
            { id: '999', name: 'Some Category', order: 1, questions: [] },
          ],
          players: [
            { id: '123', name: 'Charlie', points: 0, order: 1 },
            { id: '456', name: 'John', points: 0, order: 2 },
          ],
        },
        { id: '123', name: 'Charlie', points: 0, order: 1 },
      );

      expect(result).toMatchObject({
        answeredCorrectly: false,
        correctAnswerId: '2',
      });
    });

    it('processes correct answer', async () => {
      const dto = plainToClass(ProgressGameRequestDTO, {
        categoryId: '999',
        questionId: '1',
        answerId: '2',
        playerId: '123',
      });

      const result = await handler.progressGame(dto, '111');

      expect(
        repositoryMock['updateGameDataAfterProgress'],
      ).toHaveBeenCalledTimes(2);

      expect(
        repositoryMock['updateGameDataAfterProgress'],
      ).toHaveBeenCalledWith(
        {
          state: GameState.IN_PROGRESS,
          currentPlayerId: '123',
          nextPlayerId: '456',
          questionCategories: [
            { id: '999', name: 'Some Category', order: 1, questions: [] },
          ],
          players: [
            {
              id: '123',
              name: 'Charlie',
              points: 10,
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
        },
        { id: '123', name: 'Charlie', points: 10, order: 1 },
      );

      expect(result).toMatchObject({
        answeredCorrectly: true,
        correctAnswerId: '2',
      });
    });
  });
});
