import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CanAccessGroupGuard } from '../Guard/can-access-group.guard';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { QuestionCategory } from '@prisma/client';

@Controller('/question-categories/:groupId')
@UseGuards(
  new CheckObjectIdGuard('groupId'),
  AuthenticatedGuard,
  CanAccessGroupGuard,
)
export class QuestionCategoryResourceController {
  constructor(
    private readonly questionCategoryRepository: QuestionCategoryRepository,
  ) {}

  @Get()
  async resourceList(
    @Param('groupId') groupId: string,
  ): Promise<QuestionCategory[]> {
    return await this.questionCategoryRepository.fetchForGroup(groupId);
  }
}
