import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CheckUuidGuard } from '../../../Common/Guard/check-uuid.guard';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { QuestionCategory } from '@prisma/client';
import { CreateUpdateQuestionCategoryDTO } from '../../../Quiz/DTO/create-update-question-category.dto';
import { CreateUpdateQuestionCategoryHandler } from '../../../Quiz/Handler/create-update-question-category.handler';
import { DeleteQuestionCategoryHandler } from '../../../Quiz/Handler/delete-question-category.handler';

@Controller('/question-categories/:groupId')
@UseGuards(new CheckUuidGuard('groupId'), AuthenticatedGuard)
export class QuestionCategoryResourceController {
  constructor(
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    // TODO: have one handler for questionCategories
    // TODO: repurpose questionCategories ownership - user owns them, groups are deleted
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
  @UseGuards(new CheckUuidGuard('questionCategoryId'))
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
  @UseGuards(new CheckUuidGuard('questionCategoryId'))
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
