import { ConflictException, Injectable } from '@nestjs/common';
import { CreateGroupDTO } from '../../Presentation/UserGroup/DTO/create-group.dto';
import { Group } from '@prisma/client';
import { GroupRepository } from '../Repository/group.repository';

@Injectable()
export class CreateGroupHandler {
  constructor(private readonly groupRepository: GroupRepository) {}

  async createGroup(data: CreateGroupDTO, ownerId: string): Promise<Group> {
    const existingGroups = await this.groupRepository.findByNameForOwner(
      data.name,
      ownerId,
    );

    if (existingGroups.length > 0) {
      throw new ConflictException(
        `You already have a group named '${data.name}'`,
      );
    }

    return await this.groupRepository.createGroup(data, ownerId);
  }
}
