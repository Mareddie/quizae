import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUpdateGroupDTO } from '../../Presentation/UserGroup/DTO/create-update-group.dto';
import { Group } from '@prisma/client';
import { GroupRepository } from '../Repository/group.repository';
import { UserRepository } from '../Repository/user.repository';

@Injectable()
export class CreateGroupHandler {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createGroup(
    data: CreateUpdateGroupDTO,
    ownerId: string,
  ): Promise<Group> {
    const existingGroups = await this.groupRepository.findByNameForOwner(
      data.name,
      ownerId,
    );

    if (existingGroups.length > 0) {
      throw new ConflictException(
        `You already have a group named '${data.name}'`,
      );
    }

    if (data.users === undefined) {
      return await this.groupRepository.createGroup(data, ownerId);
    }

    return await this.groupRepository.createGroup(
      data,
      ownerId,
      await this.prepareMembers(data.users, ownerId),
    );
  }

  private async prepareMembers(
    userEmails: string[],
    ownerId: string,
  ): Promise<any> {
    const usersByEmails = await this.userRepository.getUserIdsByEmails(
      userEmails,
    );

    // Owner cannot own and be member of the same group!
    return usersByEmails.filter((row) => row.id !== ownerId);
  }
}
