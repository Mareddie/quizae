import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { QuestionRepository } from '../../../Quiz/Repository/question.repository';
import { Request } from 'express';
import { CanAccessGroupGuard } from '../Guard/can-access-group.guard';
import { QuestionWithAnswers } from '../../../Quiz/Type/question-with-answers';

@Controller('questions')
@UseGuards(AuthenticatedGuard)
export class QuestionResourceController {
  constructor(private readonly questionRepository: QuestionRepository) {}

  @Get(':groupId')
  @UseGuards(new CheckObjectIdGuard('groupId'), CanAccessGroupGuard)
  async resourceList(
    @Param('groupId') groupId: string,
    @Req() request: Request,
    @Query('filter') filter?: string,
  ): Promise<QuestionWithAnswers[]> {
    if (filter === 'myOwn') {
      return await this.questionRepository.fetchQuestions(
        groupId,
        request.user['id'],
      );
    }

    return await this.questionRepository.fetchQuestions(groupId);
  }
}
