import { ConflictException, Injectable } from '@nestjs/common';
import { GroupRepository } from '../Repository/group.repository';

@Injectable()
export class LeaveGroupHandler {
  constructor(private readonly groupRepository: GroupRepository) {}

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const groupCandidate = await this.groupRepository.findByIdAndOwner(
      groupId,
      userId,
    );

    if (groupCandidate !== null) {
      throw new ConflictException(
        'You cannot leave a group you own, but you can delete it!',
      );
    }

    return await this.groupRepository.deleteGroupMembership(groupId, userId);
  }
}
