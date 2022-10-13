import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CanAccessGroupGuard } from '../Guard/can-access-group.guard';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { QuestionCategory } from '@prisma/client';
import { CheckOriginGuard } from '../../../Common/Guard/check-origin.guard';
import { CreateUpdateQuestionCategoryDTO } from '../../../Quiz/DTO/create-update-question-category.dto';
import { CreateUpdateQuestionCategoryHandler } from '../../../Quiz/Handler/create-update-question-category.handler';
import { Response } from 'express';
import { DeleteQuestionCategoryHandler } from '../../../Quiz/Handler/delete-question-category.handler';

@Controller('/question-categories/:groupId')
@UseGuards(
  new CheckObjectIdGuard('groupId'),
  AuthenticatedGuard,
  CanAccessGroupGuard,
)
export class QuestionCategoryResourceController {
  constructor(
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    private readonly handler: CreateUpdateQuestionCategoryHandler,
    private readonly deleteHandler: DeleteQuestionCategoryHandler,
  ) {}

  @Get()
  async resourceList(
    @Param('groupId') groupId: string,
  ): Promise<QuestionCategory[]> {
    return await this.questionCategoryRepository.fetchForGroup(groupId);
  }

  @Post('create')
  @UseGuards(CheckOriginGuard)
  async createResource(
    @Param('groupId') groupId: string,
    @Body() createQuestionCategory: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    return await this.handler.createQuestion(groupId, createQuestionCategory);
  }

  @Patch(':questionCategoryId')
  @UseGuards(new CheckObjectIdGuard('questionCategoryId'), CheckOriginGuard)
  async updateResource(
    @Param('groupId') groupId: string,
    @Param('questionCategoryId') questionCategoryId: string,
    @Body() updateQuestionCategory: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    return await this.handler.updateQuestion(
      questionCategoryId,
      groupId,
      updateQuestionCategory,
    );
  }

  @Delete(':questionCategoryId')
  @UseGuards(new CheckObjectIdGuard('questionCategoryId'), CheckOriginGuard)
  async deleteResource(
    @Param('groupId') groupId: string,
    @Param('questionCategoryId') questionCategoryId: string,
    @Res() response: Response,
  ): Promise<Response> {
    await this.deleteHandler.deleteQuestionCategory(
      groupId,
      questionCategoryId,
    );

    response.status(204).json();
    return response;
  }
}
