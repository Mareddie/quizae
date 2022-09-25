import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { Group } from '@prisma/client';
import { CreateUpdateGroupDTO } from '../../Presentation/UserGroup/DTO/create-update-group.dto';

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
      // TODO: search via memberships
      return await this.prisma.group.findMany({
        where: {
          memberIDs: {
            has: ownerId,
          },
        },
      });
    }

    return [];
  }

  async createGroup(
    data: CreateUpdateGroupDTO,
    ownerId: string,
  ): Promise<Group> {
    return await this.prisma.group.create({
      data: {
        name: data.name,
        ownerId: ownerId,
      },
    });
  }

  async updateGroup(
    data: CreateUpdateGroupDTO,
    groupId: string,
  ): Promise<Group> {
    return await this.prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        name: data.name,
      },
    });
  }

  async deleteGroup(groupId: string): Promise<any> {
    // TODO: delete group
  }
}
