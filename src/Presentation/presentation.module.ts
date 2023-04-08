import { Module } from '@nestjs/common';
import { SecurityModule } from './Security/security.module';
import { UserModule } from './User/user.module';
import { QuizModule } from './Quiz/quiz.module';
import { GameSessionModule } from './GameSession/game-session.module';

@Module({
  imports: [SecurityModule, UserModule, QuizModule, GameSessionModule],
})
export class PresentationModule {}
