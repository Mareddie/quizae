import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUpdateGroupDTO } from '../../Presentation/UserGroup/DTO/create-update-group.dto';
import { Group } from '@prisma/client';
import { GroupRepository } from '../Repository/group.repository';

@Injectable()
export class UpdateGroupHandler {
  constructor(private readonly groupRepository: GroupRepository) {}

  async updateGroup(
    data: CreateUpdateGroupDTO,
    groupId: string,
    ownerId: string,
  ): Promise<Group> {
    const updateCandidate = await this.groupRepository.findByIdAndOwner(
      groupId,
      ownerId,
    );

    if (updateCandidate === null) {
      throw new ConflictException(
        'Group was not found or is not owned by authenticated User',
      );
    }

    return await this.groupRepository.updateGroup(data, groupId);
  }
}
