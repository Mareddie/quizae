import { CreateGameSessionHandler } from './create-game-session.handler';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { ReorderService } from '../../Common/Service/reorder.service';
import { ConflictException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';

describe('CreateGameSessionHandler', () => {
  let handler: CreateGameSessionHandler;

  const repositoryMock = {
    createGame: jest.fn().mockResolvedValue({ test: true }),
  };

  beforeEach(() => {
    handler = new CreateGameSessionHandler(
      repositoryMock as unknown as GameSessionRepository,
      new ReorderService(),
    );
  });

  describe('createGame', () => {
    it('throws exception on empty players', async () => {
      await expect(handler.createGame('123', [])).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates game', async () => {
      const players = [
        plainToClass(InitGameSessionPlayerDTO, {
          name: 'Matt',
          order: 1,
        }),
        plainToClass(InitGameSessionPlayerDTO, {
          name: 'Diva',
          order: 2,
        }),
      ];

      const createdGame = await handler.createGame('123', players);

      expect(createdGame).toMatchObject({ test: true });
      expect(repositoryMock['createGame']).toHaveBeenCalledTimes(1);

      expect(repositoryMock['createGame']).toHaveBeenCalledWith(
        '123',
        players,
        expect.any(Object),
      );
    });

    it('creates game with one player', async () => {
      const players = [
        plainToClass(InitGameSessionPlayerDTO, {
          name: 'Eddie',
          order: 1,
        }),
      ];

      const createdGame = await handler.createGame('123', players);

      expect(createdGame).toMatchObject({ test: true });

      expect(repositoryMock['createGame']).toHaveBeenCalledTimes(2);

      expect(repositoryMock['createGame']).toHaveBeenCalledWith(
        '123',
        players,
        expect.any(Object),
      );
    });
  });
});
