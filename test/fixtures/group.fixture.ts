import { AuthenticatedUser } from '../../src/User/Type/authenticated-user';
import { Group } from '@prisma/client';
import { AbstractFixture } from './abstract.fixture';
import { PrismaService } from '../../src/Common/Service/prisma.service';
import * as argon2 from 'argon2';

export interface GroupFixtureData {
  firstUser: AuthenticatedUser;
  secondUser: AuthenticatedUser;
  firstGroup: Group;
  secondGroup: Group;
}

export class GroupFixture implements AbstractFixture<GroupFixtureData> {
  constructor(private readonly prisma: PrismaService) {}
  private data: GroupFixtureData;

  public async up(): Promise<GroupFixtureData> {
    const userSelect = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    };

    const usersToCreate = [
      {
        email: 'firstuser@testing.test',
        firstName: 'Charlie',
        lastName: 'Tester',
        password: await argon2.hash('testing'),
      },
      {
        email: 'seconduser@testing.test',
        firstName: 'Dianne',
        lastName: 'Testerova',
        password: await argon2.hash('testing'),
      },
    ];

    const [firstUser, secondUser] = await this.prisma.$transaction(
      usersToCreate.map((userData) =>
        this.prisma.user.create({ select: userSelect, data: userData }),
      ),
    );

    const groupsToCreate = [
      {
        name: 'First Group',
        ownerId: firstUser.id,
      },
      {
        name: 'Second Group',
        ownerId: secondUser.id,
      },
    ];

    const [firstGroup, secondGroup] = await this.prisma.$transaction(
      groupsToCreate.map((groupData) =>
        this.prisma.group.create({ data: groupData }),
      ),
    );

    const membershipsToCreate = [
      {
        userId: firstUser.id,
        groupId: secondGroup.id,
      },
      {
        userId: secondUser.id,
        groupId: firstGroup.id,
      },
    ];

    await this.prisma.$transaction(
      membershipsToCreate.map((membershipData) =>
        this.prisma.groupMembership.create({ data: membershipData }),
      ),
    );

    const returnData: GroupFixtureData = {
      firstUser: firstUser,
      secondUser: secondUser,
      firstGroup: firstGroup,
      secondGroup: secondGroup,
    };

    this.data = returnData;

    return returnData;
  }

  public async down(): Promise<void> {
    // Because Groups and Memberships have cascade deletion, this will ensure that everything is deleted
    await this.prisma.user.deleteMany({
      where: {
        id: {
          in: [this.data.firstUser.id, this.data.secondUser.id],
        },
      },
    });

    return;
  }
}
