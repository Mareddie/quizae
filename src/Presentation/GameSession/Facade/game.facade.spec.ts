import { GameSessionRepository } from '../../../GameSession/Repository/game-session.repository';
import { GameState } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { GameFacade } from './game.facade';

describe('GameFacade', () => {
  let facade: GameFacade;

  const gameRepositoryMock = {
    fetchById: jest
      .fn()
      .mockResolvedValueOnce({
        state: GameState.FINISHED,
      })
      .mockResolvedValue({
        state: GameState.IN_PROGRESS,
        questionCategories: [
          {
            id: '123',
            questions: [
              {
                correctAnswer: '1',
                question: 'What is this Test?',
              },
              {
                correctAnswer: '2',
                question: 'Oh yes it is indeed a test',
              },
            ],
          },
        ],
      }),
  };

  beforeEach(() => {
    facade = new GameFacade(
      gameRepositoryMock as unknown as GameSessionRepository,
    );
  });

  describe('getQuestionForGame', () => {
    it('throws error on finished game input', async () => {
      await expect(facade.getQuestionForGame('111', '222')).rejects.toThrow(
        BadRequestException,
      );

      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledTimes(1);
      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledWith('111');
    });

    it('throws error on undefined question category', async () => {
      await expect(facade.getQuestionForGame('111', '222')).rejects.toThrow(
        BadRequestException,
      );

      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledTimes(2);
      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledWith('111');
    });

    it('returns question from game category without correct answer', async () => {
      const question = await facade.getQuestionForGame('111', '123');

      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledTimes(3);
      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledWith('111');

      expect(question).toMatchObject({
        question: expect.any(String),
      });
    });
  });
});
