import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getMockReq } from '@jest-mock/express';
import { AuthenticatedRequest } from '../src/Common/Type/authenticated-request';

export async function bootstrapApplication(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      skipUndefinedProperties: true,
      whitelist: true,
    }),
  );

  await app.init();

  return app;
}

export function getMockedAuthRequest(): AuthenticatedRequest {
  return getMockReq<AuthenticatedRequest>({
    user: {
      id: '1',
      email: 'test@test.com',
      firstName: 'Tester',
      lastName: 'Testerovic',
    },
  });
}
