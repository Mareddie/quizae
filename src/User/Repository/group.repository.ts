import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { Group } from '@prisma/client';
import { CreateGroupDTO } from '../../Presentation/UserGroup/DTO/create-group.dto';

@Injectable()
export class GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByNameForOwner(name: string, ownerId: string): Promise<Group[]> {
    return await this.prisma.group.findMany({
      where: {
        name: name,
        ownerId: ownerId,
      },
    });
  }

  async createGroup(data: CreateGroupDTO, ownerId: string): Promise<Group> {
    return await this.prisma.group.create({
      data: {
        name: data.name,
        ownerId: ownerId,
      },
    });
  }

  async getGroupsForUser(filter: string, ownerId: string): Promise<Group[]> {
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
          memberIDs: {
            has: ownerId,
          },
        },
      });
    }

    return [];
  }
}
