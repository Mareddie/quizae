import { ConflictException, Injectable } from '@nestjs/common';
import { GroupRepository } from '../Repository/group.repository';

@Injectable()
export class DeleteGroupHandler {
  constructor(private readonly groupRepository: GroupRepository) {}

  async deleteGroup(groupId: string, ownerId: string): Promise<void> {
    const deleteCandidate = await this.groupRepository.findByIdAndOwner(
      groupId,
      ownerId,
    );

    if (deleteCandidate === null) {
      throw new ConflictException(
        'Group was not found or is not owned by authenticated User',
      );
    }

    await this.groupRepository.deleteGroup(groupId);
  }
}
