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
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CheckUuidGuard } from '../../../Common/Guard/check-uuid.guard';
import { QuestionRepository } from '../../../Quiz/Repository/question.repository';
import { CanAccessCategoryGuard } from '../Guard/can-access-category.guard';
import { QuestionWithAnswers } from '../../../Quiz/Type/question-with-answers';
import { CreateUpdateQuestionDTO } from '../../../Quiz/DTO/create-update-question.dto';
import { QuestionHandler } from '../../../Quiz/Handler/question.handler';

@Controller('questions/:categoryId')
@UseGuards(
  new CheckUuidGuard('categoryId'),
  AuthenticatedGuard,
  CanAccessCategoryGuard,
)
export class QuestionResourceController {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly questionHandler: QuestionHandler,
  ) {}

  @Get()
  async resourceList(
    @Param('categoryId') categoryId: string,
  ): Promise<QuestionWithAnswers[]> {
    return await this.questionRepository.fetchQuestions(categoryId);
  }

  @Post('create')
  async createResource(
    @Param('categoryId') categoryId: string,
    @Body() createQuestion: CreateUpdateQuestionDTO,
  ): Promise<QuestionWithAnswers> {
    return await this.questionHandler.createQuestion(
      categoryId,
      createQuestion,
    );
  }

  @Patch(':questionId')
  @UseGuards(new CheckUuidGuard('questionId'))
  async updateResource(
    @Param('categoryId') categoryId: string,
    @Param('questionId') questionId: string,
    @Body() updateQuestion: CreateUpdateQuestionDTO,
  ): Promise<QuestionWithAnswers> {
    // Anyone inside the group can modify the questions and answers. No need to check for owner here.
    return await this.questionHandler.updateQuestion(
      questionId,
      categoryId,
      updateQuestion,
    );
  }

  @Delete(':questionId')
  @UseGuards(new CheckUuidGuard('questionId'))
  @HttpCode(204)
  async deleteResource(
    @Param('categoryId') categoryId: string,
    @Param('questionId') questionId: string,
  ): Promise<void> {
    await this.questionHandler.deleteQuestion(categoryId, questionId);
  }
}
