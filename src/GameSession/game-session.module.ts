import { Module } from '@nestjs/common';
import { GameSessionRepository } from './Repository/game-session.repository';
import { CreateGameSessionHandler } from './Handler/create-game-session.handler';
import { CommonModule } from '../Common/common.module';
import { GameStatusFacade } from './Facade/game-status.facade';
import { GameQuestionFacade } from './Facade/game-question.facade';

@Module({
  imports: [CommonModule],
  exports: [
    GameSessionRepository,
    CreateGameSessionHandler,
    GameStatusFacade,
    GameQuestionFacade,
  ],
  providers: [
    GameSessionRepository,
    CreateGameSessionHandler,
    GameStatusFacade,
    GameQuestionFacade,
  ],
})
export class GameSessionModule {}
