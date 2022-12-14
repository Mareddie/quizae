import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { QuestionCategory } from '@prisma/client';
import { CreateUpdateQuestionCategoryDTO } from '../../../Quiz/DTO/create-update-question-category.dto';
import { CreateUpdateQuestionCategoryHandler } from '../../../Quiz/Handler/create-update-question-category.handler';
import { Response } from 'express';
import { DeleteQuestionCategoryHandler } from '../../../Quiz/Handler/delete-question-category.handler';
import { CanAccessGroupGuard } from '../../../Common/Guard/can-access-group.guard';

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
  async createResource(
    @Param('groupId') groupId: string,
    @Body() createQuestionCategory: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    return await this.handler.createQuestionCategory(
      groupId,
      createQuestionCategory,
    );
  }

  @Patch(':questionCategoryId')
  @UseGuards(new CheckObjectIdGuard('questionCategoryId'))
  async updateResource(
    @Param('groupId') groupId: string,
    @Param('questionCategoryId') questionCategoryId: string,
    @Body() updateQuestionCategory: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    return await this.handler.updateQuestionCategory(
      questionCategoryId,
      groupId,
      updateQuestionCategory,
    );
  }

  @Delete(':questionCategoryId')
  @UseGuards(new CheckObjectIdGuard('questionCategoryId'))
  @HttpCode(204)
  async deleteResource(
    @Param('groupId') groupId: string,
    @Param('questionCategoryId') questionCategoryId: string,
  ): Promise<void> {
    await this.deleteHandler.deleteQuestionCategory(
      groupId,
      questionCategoryId,
    );
  }
}
