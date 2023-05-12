import { GameSessionModule as DomainGameSessionModule } from '../../GameSession/game-session.module';
import { Module } from '@nestjs/common';
import { GameSessionController } from './Controller/game-session.controller';
import { UserModule } from '../../User/user.module';
import { QuizModule } from '../../Quiz/quiz.module';
import { GameFacade } from './Facade/game.facade';

@Module({
  imports: [DomainGameSessionModule, UserModule, QuizModule],
  controllers: [GameSessionController],
  providers: [GameFacade],
})
export class GameSessionModule {}
