import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { QuestionRepository } from './Repository/question.repository';

@Module({
  imports: [CommonModule],
  exports: [QuestionRepository],
  providers: [QuestionRepository],
})
export class QuizModule {}
