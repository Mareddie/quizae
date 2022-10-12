import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { Group } from '@prisma/client';
import { CreateUpdateGroupDTO } from '../DTO/create-update-group.dto';
import { IdentifiedUser } from '../Type/identified-user';
import { GroupWithMemberships } from '../Type/group-with-memberships';

@Injectable()
export class GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAccessibleGroups(userId: string): Promise<string[]> {
    const ids = await this.prisma.group.findMany({
      select: {
        id: true,
      },
      where: {
        OR: [
          { ownerId: userId },
          { userMemberships: { some: { userId: { equals: userId } } } },
        ],
      },
    });

    return ids.map((row) => row.id);
  }

  async findByIdAndOwner(
    groupId: string,
    ownerId: string,
  ): Promise<Group | null> {
    return this.prisma.group.findFirst({
      where: {
        id: groupId,
        ownerId: ownerId,
      },
    });
  }

  async findByNameForOwner(name: string, ownerId: string): Promise<Group[]> {
    return this.prisma.group.findMany({
      where: {
        name: name,
        ownerId: ownerId,
      },
    });
  }

  async findGroupsForUser(filter: string, ownerId: string): Promise<Group[]> {
    if (filter === 'myOwn') {
      return this.prisma.group.findMany({
        where: {
          ownerId: ownerId,
        },
      });
    }

    if (filter === 'myMemberships') {
      return this.prisma.group.findMany({
        where: {
          userMemberships: {
            every: {
              userId: ownerId,
            },
          },
        },
      });
    }

    return [];
  }

  async createGroup(
    data: CreateUpdateGroupDTO,
    ownerId: string,
    members?: IdentifiedUser[],
  ): Promise<GroupWithMemberships> {
    const createQuery = {
      data: {
        name: data.name,
        ownerId: ownerId,
        userMemberships: {
          createMany: {
            data: [],
          },
        },
      },
      include: {
        userMemberships: true,
      },
    };

    if (members !== undefined) {
      for (const member of members) {
        createQuery.data.userMemberships.createMany.data.push({
          userId: member.id,
        });
      }
    }

    return this.prisma.group.create(createQuery);
  }

  async updateGroup(
    data: CreateUpdateGroupDTO,
    groupId: string,
    members?: IdentifiedUser[],
  ): Promise<GroupWithMemberships> {
    const deleteMembershipsQuery = {
      where: {
        groupId: groupId,
      },
    };

    const updateQuery = {
      where: {
        id: groupId,
      },
      data: {
        name: data.name,
        userMemberships: {
          createMany: {
            data: [],
          },
        },
      },
      include: {
        userMemberships: true,
      },
    };

    if (members !== undefined) {
      for (const member of members) {
        updateQuery.data.userMemberships.createMany.data.push({
          userId: member.id,
        });
      }
    }

    const [, updateResult] = await this.prisma.$transaction([
      this.prisma.groupMembership.deleteMany(deleteMembershipsQuery),
      this.prisma.group.update(updateQuery),
    ]);

    return updateResult;
  }

  async deleteGroup(groupId: string): Promise<Group> {
    return this.prisma.group.delete({
      where: {
        id: groupId,
      },
    });
  }

  async deleteGroupMembership(groupId: string, userId: string): Promise<any> {
    return this.prisma.groupMembership.deleteMany({
      where: {
        userId: userId,
        groupId: groupId,
      },
    });
  }
}
