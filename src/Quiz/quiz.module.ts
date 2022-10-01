import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { QuestionRepository } from './Repository/question.repository';
import { CreateUpdateQuestionHandler } from './Handler/create-update-question.handler';

@Module({
  imports: [CommonModule],
  exports: [QuestionRepository, CreateUpdateQuestionHandler],
  providers: [QuestionRepository, CreateUpdateQuestionHandler],
})
export class QuizModule {}
