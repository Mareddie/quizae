import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { Question } from '@prisma/client';
import { QuestionRepository } from '../../../Quiz/Repository/question.repository';

@Controller('questions')
@UseGuards(AuthenticatedGuard)
export class QuestionResourceController {
  constructor(private readonly questionRepository: QuestionRepository) {}

  @Get(':groupId')
  @UseGuards(new CheckObjectIdGuard('groupId'))
  async resourceList(
    @Param('groupId') groupId: string,
    @Query('filter') filter?: string,
  ): Promise<Question[]> {
    return await this.questionRepository.fetchQuestions(groupId, filter);
  }
}
