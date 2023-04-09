import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CheckUuidGuard } from '../../../Common/Guard/check-uuid.guard';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { QuestionCategory } from '@prisma/client';
import { CreateUpdateQuestionCategoryDTO } from '../../../Quiz/DTO/create-update-question-category.dto';
import { QuestionCategoryHandler } from '../../../Quiz/Handler/question-category.handler';
import { Request } from 'express';

@Controller('/question-categories')
@UseGuards(AuthenticatedGuard)
export class QuestionCategoryResourceController {
  constructor(
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    private readonly handler: QuestionCategoryHandler,
  ) {}

  @Get()
  async resourceList(@Req() request: Request): Promise<QuestionCategory[]> {
    return await this.questionCategoryRepository.fetchForUser(
      request.user['id'],
    );
  }

  @Post('create')
  async createResource(
    @Req() request: Request,
    @Body() createQuestionCategory: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    return await this.handler.createQuestionCategory(
      request.user['id'],
      createQuestionCategory,
    );
  }

  @Patch(':questionCategoryId')
  @UseGuards(new CheckUuidGuard('questionCategoryId'))
  async updateResource(
    @Req() request: Request,
    @Param('questionCategoryId') questionCategoryId: string,
    @Body() updateQuestionCategory: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    return await this.handler.updateQuestionCategory(
      questionCategoryId,
      request.user['id'],
      updateQuestionCategory,
    );
  }

  @Delete(':questionCategoryId')
  @UseGuards(new CheckUuidGuard('questionCategoryId'))
  @HttpCode(204)
  async deleteResource(
    @Req() request: Request,
    @Param('questionCategoryId') questionCategoryId: string,
  ): Promise<void> {
    await this.handler.deleteQuestionCategory(
      request.user['id'],
      questionCategoryId,
    );
  }
}
