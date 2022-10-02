import { Module } from '@nestjs/common';
import { SecurityModule } from './Security/security.module';
import { UserGroupModule } from './UserGroup/user-group.module';
import { QuizModule } from './Quiz/quiz.module';

@Module({
  imports: [SecurityModule, UserGroupModule, QuizModule],
})
export class PresentationModule {}
