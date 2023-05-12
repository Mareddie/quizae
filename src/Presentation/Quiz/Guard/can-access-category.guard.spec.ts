import { CanAccessCategoryGuard } from './can-access-category.guard';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { ExecutionContext } from '@nestjs/common';

describe('CanAccessCategoryGuard', () => {
  let guard: CanAccessCategoryGuard;

  const questionCategoryRepositoryMock = {
    fetchById: jest.fn().mockResolvedValue({
      id: '999',
      name: 'testing category',
      userId: '1',
      priority: 20,
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CanAccessCategoryGuard],
    })
      .useMocker((token) => {
        switch (token) {
          case QuestionCategoryRepository:
            return questionCategoryRepositoryMock;
        }
      })
      .compile();

    guard = moduleRef.get(CanAccessCategoryGuard);
  });

  // TODO: fix this test

  describe('canActivate', () => {
    it('returns false on invalid input data', async () => {
      await runGuard(guard, false);
    });

    it('returns false on inaccessible group', async () => {
      questionCategoryRepositoryMock['fetchById'].mockResolvedValueOnce({
        id: '999',
        userId: '123',
      });

      await runGuard(guard, false, '999', '1');
    });

    it('returns true', async () => {
      await runGuard(guard, true, '999', '1');
    });
  });
});

async function runGuard(
  guard: CanAccessCategoryGuard,
  expectedResult: boolean,
  categoryId?: string,
  userId?: string,
) {
  const mockContext = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        params: {
          categoryId: categoryId,
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
