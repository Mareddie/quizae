import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GroupRepository } from '../../../User/Repository/group.repository';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';

@Injectable()
export class CanAccessCategoryGuard implements CanActivate {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly questionCategoryRepository: QuestionCategoryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const categoryId = request.params.categoryId;
    const userId = request.user['id'];

    if (categoryId === undefined || userId === undefined) {
      return false;
    }

    const categoryCandidate = await this.questionCategoryRepository.fetchById(
      categoryId,
    );

    const accessibleGroups = await this.groupRepository.getAccessibleGroups(
      userId,
    );

    if (categoryCandidate === null || accessibleGroups.length === 0) {
      return false;
    }

    // The group of the Category must match with accessible groups of authenticated User
    return accessibleGroups.some(
      (accessibleGroup) => accessibleGroup === categoryCandidate.groupId,
    );
  }
}
