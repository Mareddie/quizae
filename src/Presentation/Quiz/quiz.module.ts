import { Module } from '@nestjs/common';
import { QuestionResourceController } from './Controller/question-resource.controller';
import { QuizModule as DomainQuizModule } from '../../Quiz/quiz.module';
import { UserModule } from '../../User/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DomainQuizModule, UserModule, ConfigModule],
  controllers: [QuestionResourceController],
  providers: [],
})
export class QuizModule {}