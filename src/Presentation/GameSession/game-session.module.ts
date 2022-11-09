import { GameSessionModule as DomainGameSessionModule } from '../../GameSession/game-session.module';
import { Module } from '@nestjs/common';
import { GameSessionController } from './Controller/game-session.controller';
import { UserModule } from '../../User/user.module';
import { QuizModule } from '../../Quiz/quiz.module';

@Module({
  imports: [DomainGameSessionModule, UserModule, QuizModule],
  controllers: [GameSessionController],
  providers: [],
})
export class GameSessionModule {}
