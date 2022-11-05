import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../src/Auth/Service/auth.service';
import { PrismaService } from '../src/Common/Service/prisma.service';
import { AuthenticatedUser } from '../src/User/Type/authenticated-user';
import { bootstrapApplication } from './testUtils';
import { UserFixture } from './fixtures/user.fixture';

describe('User', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fixture: UserFixture;
  let authService: AuthService;
  let authToken: string;
  let authUser: AuthenticatedUser;

  beforeAll(async () => {
    app = await bootstrapApplication();

    prisma = app.get<PrismaService>(PrismaService);

    fixture = new UserFixture(prisma);
    authService = app.get<AuthService>(AuthService);

    authUser = (await fixture.up()).user;
    authToken = await authService.generateToken(authUser);
  });

  afterAll(async () => {
    await fixture.down();
    await app.close();
  });

  it('requires authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/profile')
      .set('Accept', 'application/json')
      .send({
        email: 'updatetest@runner.test',
        firstName: 'Updated',
        lastName: 'User',
      });

    expect(response.statusCode).toEqual(401);
    expect(response.headers['content-type']).toMatch(/json/);
  });

  it("shouldn't pass validation", async () => {
    const response = await request(app.getHttpServer())
      .post('/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send({
        email: 'notanemail',
        firstName: '',
        lastName: 'User',
      });

    expect(response.statusCode).toEqual(400);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toMatchObject({
      statusCode: expect.any(Number),
      message: expect.any(Array),
      error: expect.any(String),
    });

    // Test whether the user is unchanged
    const fetchedUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    expect(authUser.email).toEqual(fetchedUser.email);

    expect(authUser).toMatchObject({
      id: fetchedUser.id,
      email: fetchedUser.email,
      firstName: fetchedUser.firstName,
      lastName: fetchedUser.lastName,
    });
  });

  it('should update user', async () => {
    const payload = {
      email: 'changedemail@testing.com',
      firstName: 'Changed',
      lastName: 'UserLastName',
    };

    const response = await request(app.getHttpServer())
      .post('/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send(payload);

    expect(response.statusCode).toEqual(204);

    // Test whether the user has changed
    const changedUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    expect(changedUser).toMatchObject({
      id: authUser.id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      password: expect.any(String),
    });
  });

  it('should update password correctly', async () => {
    const payload = {
      email: 'changedemail@testing.com',
      firstName: 'Changed',
      lastName: 'UserLastName',
      password: 'changedpassword',
    };

    const response = await request(app.getHttpServer())
      .post('/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send(payload);

    expect(response.statusCode).toEqual(204);

    // Try to validate changed User
    const authenticatedChangedUser = await authService.validateUser(
      payload.email,
      payload.password,
    );

    expect(authenticatedChangedUser).not.toBeNull();
  });

  it('should fetch profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(response.statusCode).toEqual(200);
    expect(response.headers['content-type']).toMatch(/json/);

    // The User was updated in the last test - this should return current data
    expect(response.body).toMatchObject({
      id: authUser.id,
      email: 'changedemail@testing.com',
      firstName: 'Changed',
      lastName: 'UserLastName',
    });
  });
});
