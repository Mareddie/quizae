import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { QuestionRepository } from '../../../Quiz/Repository/question.repository';
import { Request } from 'express';
import { CanAccessGroupGuard } from '../Guard/can-access-group.guard';
import { QuestionWithAnswers } from '../../../Quiz/Type/question-with-answers';
import { CheckOriginGuard } from '../../../Common/Guard/check-origin.guard';
import { CreateUpdateQuestionDTO } from '../../../Quiz/DTO/create-update-question.dto';
import { CreateUpdateQuestionHandler } from '../../../Quiz/Handler/create-update-question.handler';

@Controller('questions/:groupId')
@UseGuards(
  new CheckObjectIdGuard('groupId'),
  AuthenticatedGuard,
  CanAccessGroupGuard,
)
export class QuestionResourceController {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly questionHandler: CreateUpdateQuestionHandler,
  ) {}

  @Get()
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

  @Post('/create')
  @UseGuards(CheckOriginGuard)
  async createResource(
    @Param('groupId') groupId: string,
    @Body() createQuestion: CreateUpdateQuestionDTO,
    @Req() request: Request,
  ): Promise<QuestionWithAnswers> {
    return await this.questionHandler.createQuestion(
      groupId,
      request.user['id'],
      createQuestion,
    );
  }
}
