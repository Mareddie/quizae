import { GameSessionRepository } from '../../../GameSession/Repository/game-session.repository';
import { GameState } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { GameFacade } from './game.facade';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { QuestionRepository } from '../../../Quiz/Repository/question.repository';

describe('GameFacade', () => {
  let facade: GameFacade;

  const gameRepositoryMock = {
    fetchById: jest.fn().mockResolvedValue({
      id: '123',
      startedById: '456',
      state: GameState.IN_PROGRESS,
      startedAt: '2022-01-01',
      players: [
        {
          id: '111',
          name: 'Diva',
          points: 0,
          gameId: '123',
          order: 1,
        },
        {
          id: '222',
          name: 'Eddie',
          points: 10,
          gameId: '123',
          order: 2,
        },
      ],
      currentPlayerId: '111',
      nextPlayerId: '222',
    }),
  };

  const questionCategoryRepositoryMock = {
    getForGame: jest.fn().mockResolvedValue([
      {
        id: '000',
        name: 'Testing Category',
        priority: 10,
        _count: { questions: 3 },
      },
    ]),
  };

  const questionRepositoryMock = {
    fetchCandidatesForGame: jest.fn().mockResolvedValue([
      { id: '12345', text: 'Some testing question' },
      { id: '45678', text: 'Second Question' },
    ]),
  };

  beforeEach(() => {
    facade = new GameFacade(
      gameRepositoryMock as unknown as GameSessionRepository,
      questionCategoryRepositoryMock as unknown as QuestionCategoryRepository,
      questionRepositoryMock as unknown as QuestionRepository,
    );
  });

  describe('getGameData', () => {
    // TODO: Implement tests for this method
  });

  describe('getQuestionForGame', () => {
    it('throws error on finished game input', async () => {
      gameRepositoryMock['fetchById'].mockResolvedValueOnce({
        state: GameState.FINISHED,
      });

      await expect(facade.getQuestionForGame('111', '222')).rejects.toThrow(
        BadRequestException,
      );

      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledTimes(1);
      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledWith('111');
    });

    it('throws error on undefined question category', async () => {
      questionRepositoryMock['fetchCandidatesForGame'].mockResolvedValueOnce(
        [],
      );

      await expect(facade.getQuestionForGame('123', '222')).rejects.toThrow(
        BadRequestException,
      );

      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledTimes(2);
      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledWith('111');

      expect(
        questionRepositoryMock['fetchCandidatesForGame'],
      ).toHaveBeenCalledTimes(1);

      expect(
        questionRepositoryMock['fetchCandidatesForGame'],
      ).toHaveBeenCalledWith('222', '123');
    });

    it('returns first question if only one present', async () => {
      const questions = [
        { id: '11-11', text: 'Frist and last testing question' },
      ];

      questionRepositoryMock['fetchCandidatesForGame'].mockResolvedValueOnce(
        questions,
      );

      const result = await facade.getQuestionForGame('123', '222');

      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledTimes(3);
      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledWith('111');

      expect(
        questionRepositoryMock['fetchCandidatesForGame'],
      ).toHaveBeenCalledTimes(2);

      expect(
        questionRepositoryMock['fetchCandidatesForGame'],
      ).toHaveBeenCalledWith('222', '123');

      expect(result).toEqual(questions[0]);
    });

    it('returns any question available', async () => {
      const result = await facade.getQuestionForGame('123', '222');

      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledTimes(4);
      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledWith('111');

      expect(
        questionRepositoryMock['fetchCandidatesForGame'],
      ).toHaveBeenCalledTimes(3);

      expect(
        questionRepositoryMock['fetchCandidatesForGame'],
      ).toHaveBeenCalledWith('222', '123');

      expect(result).toEqual(expect.any(Object));
    });
  });
});
