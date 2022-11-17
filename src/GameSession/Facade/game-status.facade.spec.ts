import { GameStatusFacade } from './game-status.facade';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { ReorderService } from '../../Common/Service/reorder.service';
import { GameState } from '@prisma/client';

describe('GameStatusFacade', () => {
  let facade: GameStatusFacade;

  const gameData = {
    id: '1',
    startedById: '1',
    state: GameState.IN_PROGRESS,
    currentPlayerId: null,
    nextPlayerId: null,
    startedAt: new Date(),
    players: [
      {
        id: '2',
        name: 'Markus',
        points: 0,
        order: 2,
      },
      {
        id: '1',
        name: 'Eddie',
        points: 0,
        order: 1,
      },
      {
        id: '3',
        name: 'Lucius',
        points: 0,
        order: 3,
      },
    ],
    questionCategories: [
      {
        id: '2',
        name: 'Another Category',
        order: 2,
        questions: [
          {
            name: 'Ask Me',
          },
          {
            name: 'Test Question',
          },
        ],
      },
      {
        id: '1',
        name: 'Test Question Category',
        order: 1,
        questions: [
          {
            name: 'Some Question',
          },
          {
            name: 'Another Question',
          },
        ],
      },
    ],
  };

  const gameRepositoryMock = {
    fetchById: jest.fn().mockResolvedValue(gameData),
    updateGameFromInternalData: jest.fn().mockResolvedValue({ test: true }),
  };

  beforeEach(() => {
    facade = new GameStatusFacade(
      gameRepositoryMock as unknown as GameSessionRepository,
      new ReorderService(),
    );
  });

  describe('getGameStatus', () => {
    beforeEach(() => {
      gameRepositoryMock['fetchById'].mockClear();
      gameRepositoryMock['updateGameFromInternalData'].mockClear();
    });

    it('fetches game status for game with multiple players', async () => {
      const result = await facade.getGameStatus('123');

      expect(result).toMatchObject({
        id: gameData.id,
        startedById: gameData.startedById,
        state: gameData.state,
        currentPlayerId: '1',
        nextPlayerId: '2',
        players: gameData.players,
        categoryStatuses: [
          {
            id: gameData.questionCategories[1].id,
            name: gameData.questionCategories[1].name,
            order: gameData.questionCategories[1].order,
            questionCount: 2,
          },
          {
            id: gameData.questionCategories[0].id,
            name: gameData.questionCategories[0].name,
            order: gameData.questionCategories[0].order,
            questionCount: 2,
          },
        ],
        startedAt: gameData.startedAt,
      });

      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledTimes(1);

      expect(
        gameRepositoryMock['updateGameFromInternalData'],
      ).toHaveBeenCalledTimes(1);
    });

    it('fetches game status without determining players', async () => {
      gameData.currentPlayerId = '333';
      gameData.nextPlayerId = '444';

      const result = await facade.getGameStatus('123');

      expect(result).toMatchObject({
        id: gameData.id,
        startedById: gameData.startedById,
        state: gameData.state,
        currentPlayerId: '333',
        nextPlayerId: '444',
        players: gameData.players,
        categoryStatuses: [
          {
            id: gameData.questionCategories[1].id,
            name: gameData.questionCategories[1].name,
            order: gameData.questionCategories[1].order,
            questionCount: 2,
          },
          {
            id: gameData.questionCategories[0].id,
            name: gameData.questionCategories[0].name,
            order: gameData.questionCategories[0].order,
            questionCount: 2,
          },
        ],
        startedAt: gameData.startedAt,
      });

      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledTimes(1);

      expect(
        gameRepositoryMock['updateGameFromInternalData'],
      ).not.toHaveBeenCalled();
    });

    it('assumes with only one player', async () => {
      gameData.currentPlayerId = null;
      gameData.nextPlayerId = null;
      gameData.players = [gameData.players[0]];

      const result = await facade.getGameStatus('123');

      expect(result).toMatchObject({
        id: gameData.id,
        startedById: gameData.startedById,
        state: gameData.state,
        currentPlayerId: '1',
        nextPlayerId: '1',
        players: gameData.players,
        categoryStatuses: [
          {
            id: gameData.questionCategories[1].id,
            name: gameData.questionCategories[1].name,
            order: gameData.questionCategories[1].order,
            questionCount: 2,
          },
          {
            id: gameData.questionCategories[0].id,
            name: gameData.questionCategories[0].name,
            order: gameData.questionCategories[0].order,
            questionCount: 2,
          },
        ],
        startedAt: gameData.startedAt,
      });

      expect(gameRepositoryMock['fetchById']).toHaveBeenCalledTimes(1);

      expect(
        gameRepositoryMock['updateGameFromInternalData'],
      ).toHaveBeenCalledTimes(1);
    });
  });
});
