import { Module } from '@nestjs/common';
import { GameSessionRepository } from './Repository/game-session.repository';
import { CreateGameSessionHandler } from './Handler/create-game-session.handler';
import { CommonModule } from '../Common/common.module';
import { GameStatusFacade } from './Facade/game-status.facade';

@Module({
  imports: [CommonModule],
  exports: [GameSessionRepository, CreateGameSessionHandler, GameStatusFacade],
  providers: [
    GameSessionRepository,
    CreateGameSessionHandler,
    GameStatusFacade,
  ],
})
export class GameSessionModule {}
