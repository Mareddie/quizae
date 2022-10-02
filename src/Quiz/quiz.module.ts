import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { QuestionRepository } from './Repository/question.repository';
import { CreateUpdateQuestionHandler } from './Handler/create-update-question.handler';
import { DeleteQuestionHandler } from './Handler/delete-question.handler';

@Module({
  imports: [CommonModule],
  exports: [
    QuestionRepository,
    CreateUpdateQuestionHandler,
    DeleteQuestionHandler,
  ],
  providers: [
    QuestionRepository,
    CreateUpdateQuestionHandler,
    DeleteQuestionHandler,
  ],
})
export class QuizModule {}
