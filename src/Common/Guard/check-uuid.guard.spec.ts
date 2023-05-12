import { CheckUuidGuard } from './check-uuid.guard';
import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, ExecutionContext } from '@nestjs/common';

describe('CheckUuidGuard', () => {
  let guard: CheckUuidGuard;

  beforeEach(() => {
    guard = new CheckUuidGuard('testId');
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

    it('passes correct uuid v4', async () => {
      await runGuard(guard, '9ea56bec-9902-499f-acbd-37d50e8f8525', true);
    });
  });
});

async function runGuard(
  guard: CheckUuidGuard,
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
