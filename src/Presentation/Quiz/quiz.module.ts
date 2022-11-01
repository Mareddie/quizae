import { Module } from '@nestjs/common';
import { QuestionResourceController } from './Controller/question-resource.controller';
import { QuizModule as DomainQuizModule } from '../../Quiz/quiz.module';
import { UserModule } from '../../User/user.module';
import { QuestionCategoryResourceController } from './Controller/question-category-resource.controller';

@Module({
  imports: [DomainQuizModule, UserModule],
  controllers: [QuestionResourceController, QuestionCategoryResourceController],
  providers: [],
})
export class QuizModule {}
