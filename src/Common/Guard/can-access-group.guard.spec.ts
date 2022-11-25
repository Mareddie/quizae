import { CanAccessGroupGuard } from './can-access-group.guard';
import { GroupRepository } from '../../User/Repository/group.repository';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

describe('CanAccessGroupGuard', () => {
  let guard: CanAccessGroupGuard;

  const repositoryMock = {
    getAccessibleGroups: jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValue(['123', '456']),
  };

  beforeEach(async () => {
    guard = new CanAccessGroupGuard(
      repositoryMock as unknown as GroupRepository,
    );
  });

  describe('canActivate', () => {
    it('returns false on undefined group or user', async () => {
      await runGuard(guard, false);
    });

    it('returns false on found empty accessible groups', async () => {
      await runGuard(guard, false, '999', '222');

      expect(repositoryMock['getAccessibleGroups']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['getAccessibleGroups']).toHaveBeenCalledWith('222');
    });

    it('returns true on correct match', async () => {
      await runGuard(guard, true, '123', '222');

      expect(repositoryMock['getAccessibleGroups']).toHaveBeenCalledTimes(2);
      expect(repositoryMock['getAccessibleGroups']).toHaveBeenCalledWith('222');
    });
  });
});

async function runGuard(
  guard: CanAccessGroupGuard,
  expectedResult: boolean,
  groupId?: string,
  userId?: string,
) {
  const mockContext = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        params: {
          groupId: groupId,
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
