import { Module } from '@nestjs/common';
import { QuestionResourceController } from './Controller/question-resource.controller';
import { QuizModule as DomainQuizModule } from '../../Quiz/quiz.module';
import { UserModule } from '../../User/user.module';

@Module({
  imports: [DomainQuizModule, UserModule],
  controllers: [QuestionResourceController],
  providers: [],
})
export class QuizModule {}
