import { Module } from '@nestjs/common';
import { SecurityModule } from './Security/security.module';
import { UserGroupModule } from './UserGroup/user-group.module';
import { QuizModule } from './Quiz/quiz.module';
import { GameSessionModule } from './GameSession/game-session.module';

@Module({
  imports: [SecurityModule, UserGroupModule, QuizModule, GameSessionModule],
})
export class PresentationModule {}
