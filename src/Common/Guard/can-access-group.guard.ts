import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GroupRepository } from '../../User/Repository/group.repository';

@Injectable()
export class CanAccessGroupGuard implements CanActivate {
  constructor(private readonly groupRepository: GroupRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const groupId = request.params.groupId;
    const userId = request.user['id'];

    if (groupId === undefined || userId === undefined) {
      return false;
    }

    const accessibleGroups = await this.groupRepository.getAccessibleGroups(
      userId,
    );

    if (accessibleGroups.length === 0) {
      return false;
    }

    return accessibleGroups.some(
      (accessibleGroup) => accessibleGroup === groupId,
    );
  }
}
