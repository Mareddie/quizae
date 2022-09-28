import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { Group } from '@prisma/client';
import { CreateUpdateGroupDTO } from '../DTO/create-update-group.dto';
import { IdentifiedUser } from '../Type/identified-user';

@Injectable()
export class GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdAndOwner(
    groupId: string,
    ownerId: string,
  ): Promise<Group | null> {
    return await this.prisma.group.findFirst({
      where: {
        id: groupId,
        ownerId: ownerId,
      },
    });
  }

  async findByNameForOwner(name: string, ownerId: string): Promise<Group[]> {
    return await this.prisma.group.findMany({
      where: {
        name: name,
        ownerId: ownerId,
      },
    });
  }

  async findGroupsForUser(filter: string, ownerId: string): Promise<Group[]> {
    if (filter === 'myOwn') {
      return await this.prisma.group.findMany({
        where: {
          ownerId: ownerId,
        },
      });
    }

    if (filter === 'myMemberships') {
      return await this.prisma.group.findMany({
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
  ): Promise<Group> {
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
      for (const key in members) {
        createQuery.data.userMemberships.createMany.data.push({
          userId: members[key].id,
        });
      }
    }

    console.log(createQuery);

    return await this.prisma.group.create(createQuery);
  }

  async updateGroup(
    data: CreateUpdateGroupDTO,
    groupId: string,
    members?: IdentifiedUser[],
  ): Promise<Group> {
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
      for (const key in members) {
        updateQuery.data.userMemberships.createMany.data.push({
          userId: members[key].id,
        });
      }
    }

    const [, updateResult] = await this.prisma.$transaction([
      this.prisma.groupMembership.deleteMany(deleteMembershipsQuery),
      this.prisma.group.update(updateQuery),
    ]);

    return updateResult;
  }

  async deleteGroup(groupId: string): Promise<void> {
    await this.prisma.group.delete({
      where: {
        id: groupId,
      },
    });

    return;
  }

  async deleteGroupMembership(groupId: string, userId: string): Promise<void> {
    await this.prisma.groupMembership.deleteMany({
      where: {
        userId: userId,
        groupId: groupId,
      },
    });
  }
}
