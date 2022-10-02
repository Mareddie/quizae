import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { QuestionRepository } from '../../../Quiz/Repository/question.repository';
import { Request, Response } from 'express';
import { CanAccessGroupGuard } from '../Guard/can-access-group.guard';
import { QuestionWithAnswers } from '../../../Quiz/Type/question-with-answers';
import { CheckOriginGuard } from '../../../Common/Guard/check-origin.guard';
import { CreateUpdateQuestionDTO } from '../../../Quiz/DTO/create-update-question.dto';
import { CreateUpdateQuestionHandler } from '../../../Quiz/Handler/create-update-question.handler';
import { DeleteQuestionHandler } from '../../../Quiz/Handler/delete-question.handler';

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
    private readonly deleteHandler: DeleteQuestionHandler,
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

  @Post('create')
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

  @Patch(':questionId')
  @UseGuards(new CheckObjectIdGuard('questionId'), CheckOriginGuard)
  async updateResource(
    @Param('groupId') groupId: string,
    @Param('questionId') questionId: string,
    @Body() updateQuestion: CreateUpdateQuestionDTO,
  ): Promise<QuestionWithAnswers> {
    // Anyone inside the group can modify the questions and answers. No need to check for owner here.
    return await this.questionHandler.updateQuestion(
      questionId,
      groupId,
      updateQuestion,
    );
  }

  @Delete(':questionId')
  @UseGuards(new CheckObjectIdGuard('questionId'), CheckOriginGuard)
  async deleteResource(
    @Param('groupId') groupId: string,
    @Param('questionId') questionId: string,
    @Res() response: Response,
  ): Promise<Response> {
    // Anyone inside the group can delete questions (with answers)
    await this.deleteHandler.deleteQuestion(groupId, questionId);

    response.status(204).json();
    return response;
  }
}
