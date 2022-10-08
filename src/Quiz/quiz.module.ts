import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { QuestionRepository } from './Repository/question.repository';
import { CreateUpdateQuestionHandler } from './Handler/create-update-question.handler';
import { DeleteQuestionHandler } from './Handler/delete-question.handler';
import { QuestionCategoryRepository } from './Repository/question-category.repository';

@Module({
  imports: [CommonModule],
  exports: [
    QuestionRepository,
    QuestionCategoryRepository,
    CreateUpdateQuestionHandler,
    DeleteQuestionHandler,
  ],
  providers: [
    QuestionRepository,
    QuestionCategoryRepository,
    CreateUpdateQuestionHandler,
    DeleteQuestionHandler,
  ],
})
export class QuizModule {}
