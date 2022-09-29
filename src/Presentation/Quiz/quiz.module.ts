import { Module } from '@nestjs/common';
import { QuestionResourceController } from './Controller/question-resource.controller';
import { QuizModule as DomainQuizModule } from '../../Quiz/quiz.module';

@Module({
  imports: [DomainQuizModule],
  controllers: [QuestionResourceController],
  providers: [],
})
export class QuizModule {}
