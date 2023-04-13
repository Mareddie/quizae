import { GameSessionController } from './game-session.controller';
import { Test } from '@nestjs/testing';
import { CreateGameSessionHandler } from '../../../GameSession/Handler/create-game-session.handler';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { ProgressGameSessionHandler } from '../../../GameSession/Handler/progress-game-session.handler';
import { CanAccessGameGuard } from '../Guard/can-access-game.guard';
import { getMockedAuthRequest } from '../../../../test/testUtils';
import { plainToClass } from 'class-transformer';
import { CreateGameSessionRequestDTO } from '../../../GameSession/DTO/create-game-session-request.dto';
import { ProgressGameRequestDTO } from '../../../GameSession/DTO/progress-game-request.dto';
import { GameFacade } from '../Facade/game.facade';

describe('GameSessionController', () => {
  let controller: GameSessionController;

  const createHandlerMock = {
    createGame: jest.fn().mockResolvedValue('createdGameWithPlayers'),
  };

  const questionCategoryRepositoryMock = {
    fetchForGame: jest.fn().mockResolvedValue('fetchedForGame'),
  };

  const progressGameHandlerMock = {
    progressGame: jest.fn().mockResolvedValue('progressGame'),
    endGame: jest.fn().mockResolvedValue('endGame'),
  };

  const gameQuestionFacadeMock = {
    getQuestionForGame: jest.fn().mockResolvedValue('questionForGame'),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GameSessionController],
    })
      .useMocker((token) => {
        switch (token) {
          case CreateGameSessionHandler:
            return createHandlerMock;
          case QuestionCategoryRepository:
            return questionCategoryRepositoryMock;
          case ProgressGameSessionHandler:
            return progressGameHandlerMock;
          case GameFacade:
            return gameQuestionFacadeMock;
          default:
            throw new Error(`Undefined token for mocking: ${String(token)}`);
        }
      })
      .overrideGuard(CanAccessGameGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(GameSessionController);
  });

  describe('createGame', () => {
    it('creates game', async () => {
      const dto = plainToClass(CreateGameSessionRequestDTO, {
        players: [
          {
            name: 'Eddie',
            order: 2,
          },
          {
            name: 'Diva',
            order: 1,
          },
          {
            name: 'Matt',
            order: 3,
          },
        ],
      });

      const req = getMockedAuthRequest();

      const createGame = await controller.createGame(req, dto);

      expect(
        questionCategoryRepositoryMock['fetchForGame'],
      ).toHaveBeenCalledTimes(1);

      expect(
        questionCategoryRepositoryMock['fetchForGame'],
      ).toHaveBeenCalledWith('123');

      expect(createHandlerMock['createGame']).toHaveBeenCalledTimes(1);

      expect(createHandlerMock['createGame']).toHaveBeenCalledWith(
        req.user.id,
        'fetchedForGame',
        dto.players,
      );

      expect(createGame).toEqual('createdGameWithPlayers');
    });
  });

  describe('getGameStatus', () => {
    it('returns game status', async () => {
      const gameStatus = await controller.getGameStatus('123');

      // TODO: fix tests once new logic is implemented

      expect(gameStatus).toEqual('gameStatus');
    });
  });

  describe('getGameQuestion', () => {
    it('returns game question', async () => {
      const gameQuestion = await controller.getGameQuestion('123', '456');

      expect(
        gameQuestionFacadeMock['getQuestionForGame'],
      ).toHaveBeenCalledTimes(1);

      expect(gameQuestionFacadeMock['getQuestionForGame']).toHaveBeenCalledWith(
        '123',
        '456',
      );

      expect(gameQuestion).toEqual('questionForGame');
    });
  });

  describe('progressGame', () => {
    it('progresses game', async () => {
      const dto = plainToClass(ProgressGameRequestDTO, {
        categoryId: '123',
        questionId: '456',
        answerId: '456',
        playerId: '123',
      });

      const progressGame = await controller.progressGame('123', dto);

      expect(progressGameHandlerMock['progressGame']).toHaveBeenCalledTimes(1);

      expect(progressGameHandlerMock['progressGame']).toHaveBeenCalledWith(
        dto,
        '123',
      );

      expect(progressGame).toEqual('progressGame');
    });
  });

  describe('finishGame', () => {
    it('finishes game', async () => {
      const finishGame = await controller.finishGame('123');

      expect(progressGameHandlerMock['endGame']).toHaveBeenCalledTimes(1);
      expect(progressGameHandlerMock['endGame']).toHaveBeenCalledWith('123');

      expect(finishGame).toEqual('endGame');
    });
  });
});
