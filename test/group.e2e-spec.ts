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

  it('creates group with member', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/groups/create')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send({ name: 'Awesome Group', users: [testData.secondUser.email] });

    expect(createResponse.statusCode).toEqual(201);
    expect(createResponse.headers['content-type']).toMatch(/json/);

    expect(createResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Awesome Group',
        userMemberships: expect.any(Array),
      }),
    );

    expect(createResponse.body.userMemberships.length).toEqual(1);

    expect(createResponse.body.userMemberships[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        userId: testData.secondUser.id,
        groupId: createResponse.body.id,
      }),
    );

    const createdGroup = await prisma.group.findUnique({
      include: {
        userMemberships: true,
      },
      where: {
        id: createResponse.body.id,
      },
    });

    expect(createdGroup).toMatchObject({
      id: createResponse.body.id,
      name: createResponse.body.name,
      createdAt: expect.any(Date),
      ownerId: createResponse.body.ownerId,
      userMemberships: expect.any(Array),
    });

    expect(createdGroup.userMemberships.length).toEqual(1);

    expect(createdGroup.userMemberships[0]).toMatchObject({
      id: expect.any(String),
      userId: testData.secondUser.id,
      groupId: createdGroup.id,
    });
  });

  it('edits group', async () => {
    const editResponse = await request(app.getHttpServer())
      .patch(`/groups/${testData.firstGroup.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json')
      .send({ name: 'Edited First Group', users: [] });

    expect(editResponse.statusCode).toEqual(200);
    expect(editResponse.headers['content-type']).toMatch(/json/);

    expect(editResponse.body).toEqual(
      expect.objectContaining({
        id: testData.firstGroup.id,
        name: 'Edited First Group',
        userMemberships: expect.any(Array),
      }),
    );

    expect(editResponse.body.userMemberships.length).toEqual(0);

    const editedGroup = await prisma.group.findUnique({
      include: {
        userMemberships: true,
      },
      where: {
        id: editResponse.body.id,
      },
    });

    expect(editedGroup).toMatchObject({
      id: editResponse.body.id,
      name: editResponse.body.name,
      createdAt: expect.any(Date),
      ownerId: editResponse.body.ownerId,
      userMemberships: expect.any(Array),
    });

    expect(editedGroup.userMemberships.length).toEqual(0);
  });

  it('deletes group', async () => {
    const deleteResponse = await request(app.getHttpServer())
      .delete(`/groups/${testData.firstGroup.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(deleteResponse.statusCode).toEqual(204);

    const deletedGroup = await prisma.group.findUnique({
      where: {
        id: testData.firstGroup.id,
      },
    });

    expect(deletedGroup).toBeNull();

    const deletedGroupMemberships = await prisma.groupMembership.findMany({
      where: {
        groupId: testData.firstGroup.id,
      },
    });

    expect(deletedGroupMemberships).toBeInstanceOf(Array);
    expect(deletedGroupMemberships.length).toEqual(0);
  });

  it('tests leaving of group', async () => {
    const leaveResponse = await request(app.getHttpServer())
      .patch(`/groups/${testData.secondGroup.id}/leave`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    expect(leaveResponse.statusCode).toEqual(204);

    const leftGroupMembership = await prisma.groupMembership.findFirst({
      where: {
        groupId: testData.secondGroup.id,
        userId: testData.firstUser.id,
      },
    });

    expect(leftGroupMembership).toBeNull();
  });
});
