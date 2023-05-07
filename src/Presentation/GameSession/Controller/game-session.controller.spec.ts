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
import { QuestionRepository } from '../../../Quiz/Repository/question.repository';

describe('GameSessionController', () => {
  // TODO: These tests are not working, rewrite them
  let controller: GameSessionController;

  const createHandlerMock = {
    createGame: jest.fn().mockResolvedValue('createdGameWithPlayers'),
  };

  const questionCategoryRepositoryMock = {
    fetchForGame: jest.fn().mockResolvedValue('fetchedForGame'),
  };

  const questionRepositoryMock = {
    fetchForGameProgress: jest.fn().mockResolvedValue('game question boi'),
  };

  const progressGameHandlerMock = {
    progressGame: jest.fn().mockResolvedValue('progressGame'),
    endGame: jest.fn().mockResolvedValue('endGame'),
  };

  const gameFacadeMock = {
    getQuestionForGame: jest.fn().mockResolvedValue('questionForGame'),
    getGameData: jest.fn().mockResolvedValue('gameData'),
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
          case QuestionRepository:
            return questionRepositoryMock;
          case ProgressGameSessionHandler:
            return progressGameHandlerMock;
          case GameFacade:
            return gameFacadeMock;
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

      expect(createHandlerMock['createGame']).toHaveBeenCalledTimes(1);

      expect(createHandlerMock['createGame']).toHaveBeenCalledWith(
        req.user.id,
        dto.players,
      );

      expect(createGame).toEqual('createdGameWithPlayers');
    });
  });

  describe('getGameStatus', () => {
    it('returns game status', async () => {
      const gameStatus = await controller.getGameStatus('123');

      expect(gameFacadeMock['getGameData']).toHaveBeenCalledTimes(1);
      expect(gameFacadeMock['getGameData']).toHaveBeenCalledWith('123');

      expect(gameStatus).toEqual('gameData');
    });
  });

  describe('getGameQuestion', () => {
    it('returns game question', async () => {
      const gameQuestion = await controller.getGameQuestion('123', '456');

      expect(gameFacadeMock['getQuestionForGame']).toHaveBeenCalledTimes(1);

      expect(gameFacadeMock['getQuestionForGame']).toHaveBeenCalledWith(
        '123',
        '456',
      );

      expect(gameQuestion).toEqual('questionForGame');
    });
  });

  describe('progressGame', () => {
    it('progresses game', async () => {
      const dto = plainToClass(ProgressGameRequestDTO, {
        questionId: '456',
        answerId: '456',
        playerId: '123',
      });

      const progressGame = await controller.progressGame(
        '123',
        dto,
        getMockedAuthRequest(),
      );

      expect(
        questionRepositoryMock['fetchForGameProgress'],
      ).toHaveBeenCalledTimes(1);

      expect(
        questionRepositoryMock['fetchForGameProgress'],
      ).toHaveBeenCalledWith(dto.questionId, '123', '1');

      expect(progressGameHandlerMock['progressGame']).toHaveBeenCalledTimes(1);

      expect(progressGameHandlerMock['progressGame']).toHaveBeenCalledWith(
        'game question boi',
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
