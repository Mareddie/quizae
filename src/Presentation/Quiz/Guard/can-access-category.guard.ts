import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';

@Injectable()
export class CanAccessCategoryGuard implements CanActivate {
  constructor(
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

    return !(categoryCandidate === null || categoryCandidate.userId !== userId);
  }
}
