import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/Common/Service/prisma.service';
import { AuthService } from '../src/Auth/Service/auth.service';
import * as request from 'supertest';
import { bootstrapApplication } from './testUtils';
import { AuthenticatedUser } from '../src/User/Type/authenticated-user';

describe('User Groups', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let authUser: AuthenticatedUser;

  beforeAll(async () => {
    app = await bootstrapApplication();

    const authService = app.get<AuthService>(AuthService);

    authUser = await authService.validateUser('tester@runner.test', 'testing');
    authToken = await authService.generateToken(authUser);

    prisma = app.get<PrismaService>(PrismaService);

    // TODO: Prepare and call fixtures here
  });

  afterAll(async () => {
    await app.close();
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/groups').expect(401);
    await request(app.getHttpServer()).post('/groups/create').expect(401);
  });
});
