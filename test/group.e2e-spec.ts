import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/Common/Service/prisma.service';
import { AuthService } from '../src/Auth/Service/auth.service';
import * as request from 'supertest';
import { bootstrapApplication } from './testUtils';
import { GroupFixture, GroupFixtureData } from './fixtures/group.fixture';

describe('User Groups', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fixture: GroupFixture;
  let testData: GroupFixtureData;
  let authToken: string;

  beforeAll(async () => {
    app = await bootstrapApplication();

    const authService = app.get<AuthService>(AuthService);

    prisma = app.get<PrismaService>(PrismaService);
    fixture = new GroupFixture(prisma);

    testData = await fixture.up();

    authToken = await authService.generateToken(testData.firstUser);
  });

  afterAll(async () => {
    await fixture.down();
    await app.close();
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/groups').expect(401);
    await request(app.getHttpServer()).post('/groups/create').expect(401);

    await request(app.getHttpServer())
      .patch(`/groups/${testData.firstGroup}`)
      .expect(401);

    await request(app.getHttpServer())
      .delete(`/groups/${testData.firstGroup}`)
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/groups/${testData.firstGroup}/leave`)
      .expect(401);
  });

  it('returns correct group lists', async () => {
    const myGroupsResponse = await request(app.getHttpServer())
      .get('/groups')
      .query({ filter: 'myOwn' })
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(myGroupsResponse.statusCode).toEqual(200);
    expect(myGroupsResponse.headers['content-type']).toMatch(/json/);

    expect(myGroupsResponse.body).toBeInstanceOf(Array);
    expect(myGroupsResponse.body.length).toEqual(1);

    expect(myGroupsResponse.body[0]).toEqual(
      expect.objectContaining({
        id: testData.firstGroup.id,
        name: testData.firstGroup.name,
        createdAt: expect.any(String),
        ownerId: testData.firstUser.id,
      }),
    );

    const myMemberships = await request(app.getHttpServer())
      .get('/groups')
      .query({ filter: 'myMemberships' })
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(myMemberships.statusCode).toEqual(200);
    expect(myMemberships.headers['content-type']).toMatch(/json/);

    expect(myMemberships.body).toBeInstanceOf(Array);
    expect(myMemberships.body.length).toEqual(1);

    expect(myMemberships.body[0]).toEqual(
      expect.objectContaining({
        id: testData.secondGroup.id,
        name: testData.secondGroup.name,
        createdAt: expect.any(String),
        ownerId: testData.secondUser.id,
      }),
    );
  });

  // TODO: edit group, delete group, leave group tests
});
