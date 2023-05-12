import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { QuestionRepository } from './Repository/question.repository';
import { QuestionHandler } from './Handler/question.handler';
import { QuestionCategoryRepository } from './Repository/question-category.repository';
import { QuestionCategoryHandler } from './Handler/question-category.handler';

@Module({
  imports: [CommonModule],
  exports: [
    QuestionRepository,
    QuestionCategoryRepository,
    QuestionHandler,
    QuestionCategoryHandler,
  ],
  providers: [
    QuestionRepository,
    QuestionCategoryRepository,
    QuestionHandler,
    QuestionCategoryHandler,
  ],
})
export class QuizModule {}
