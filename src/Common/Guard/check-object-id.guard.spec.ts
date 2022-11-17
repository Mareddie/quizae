import { CheckObjectIdGuard } from './check-object-id.guard';
import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, ExecutionContext } from '@nestjs/common';

describe('CheckObjectIdGuard', () => {
  let guard: CheckObjectIdGuard;

  beforeEach(() => {
    guard = new CheckObjectIdGuard('testId');
  });

  describe('canActivate', () => {
    it('throws exception on undefined property', async () => {
      await expect(runGuard(guard)).rejects.toThrow(BadRequestException);
    });

    it('throws exception on unexpected property type', async () => {
      await expect(runGuard(guard, 12345)).rejects.toThrow(BadRequestException);
    });

    it('throws exception on invalid object id', async () => {
      await expect(runGuard(guard, '12345')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('passes correct object id', async () => {
      await runGuard(guard, '637604b344c8d0e01686f288', true);
    });
  });
});

async function runGuard(
  guard: CheckObjectIdGuard,
  testId?: any,
  expectedResult?: boolean,
) {
  const params = {};

  if (testId !== undefined) {
    params['testId'] = testId;
  }

  const mockContext = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        params: params,
      }),
    }),
  });

  expect(mockContext.switchToHttp()).toBeDefined();
  expect(mockContext.switchToHttp().getRequest()).toBeDefined();

  const result = await guard.canActivate(mockContext);

  if (expectedResult !== undefined) {
    expect(result).toEqual(expectedResult);
  }
}
