import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { QuestionRepository } from './Repository/question.repository';
import { CreateUpdateQuestionHandler } from './Handler/create-update-question.handler';
import { DeleteQuestionHandler } from './Handler/delete-question.handler';
import { QuestionCategoryRepository } from './Repository/question-category.repository';
import { CreateUpdateQuestionCategoryHandler } from './Handler/create-update-question-category.handler';
import { DeleteQuestionCategoryHandler } from './Handler/delete-question-category.handler';

@Module({
  imports: [CommonModule],
  exports: [
    QuestionRepository,
    QuestionCategoryRepository,
    CreateUpdateQuestionHandler,
    CreateUpdateQuestionCategoryHandler,
    DeleteQuestionHandler,
    DeleteQuestionCategoryHandler,
  ],
  providers: [
    QuestionRepository,
    QuestionCategoryRepository,
    CreateUpdateQuestionHandler,
    CreateUpdateQuestionCategoryHandler,
    DeleteQuestionHandler,
    DeleteQuestionCategoryHandler,
  ],
})
export class QuizModule {}
