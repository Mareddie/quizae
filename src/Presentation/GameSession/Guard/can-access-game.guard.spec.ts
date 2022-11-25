import { CanAccessGameGuard } from './can-access-game.guard';
import { Test } from '@nestjs/testing';
import { GameSessionRepository } from '../../../GameSession/Repository/game-session.repository';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

describe('CanAccessGameGuard', () => {
  let guard: CanAccessGameGuard;

  const repositoryMock = {
    fetchForUser: jest.fn().mockResolvedValue([
      {
        id: '123',
      },
      {
        id: '456',
      },
    ]),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CanAccessGameGuard],
    })
      .useMocker((token) => {
        if (token === GameSessionRepository) {
          return repositoryMock;
        }
      })
      .compile();

    guard = moduleRef.get(CanAccessGameGuard);
  });

  describe('canActivate', () => {
    it('returns false on undefined user or game', async () => {
      await runGuard(guard, false);
    });

    it('returns true for correct game', async () => {
      await runGuard(guard, true, '123', '777');

      expect(repositoryMock['fetchForUser']).toHaveBeenCalledTimes(1);

      expect(repositoryMock['fetchForUser']).toHaveBeenCalledWith('777');
    });
  });
});

async function runGuard(
  guard: CanAccessGameGuard,
  expectedResult: boolean,
  gameId?: string,
  userId?: string,
) {
  const mockContext = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        params: {
          gameId: gameId,
        },
        user: {
          id: userId,
        },
      }),
    }),
  });

  expect(mockContext.switchToHttp()).toBeDefined();
  expect(mockContext.switchToHttp().getRequest()).toBeDefined();

  const result = await guard.canActivate(mockContext);

  expect(result).toEqual(expectedResult);
}
