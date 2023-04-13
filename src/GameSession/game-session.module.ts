import { Module } from '@nestjs/common';
import { GameSessionRepository } from './Repository/game-session.repository';
import { CreateGameSessionHandler } from './Handler/create-game-session.handler';
import { CommonModule } from '../Common/common.module';
import { ProgressGameSessionHandler } from './Handler/progress-game-session.handler';

@Module({
  imports: [CommonModule],
  exports: [
    GameSessionRepository,
    CreateGameSessionHandler,
    ProgressGameSessionHandler,
  ],
  providers: [
    GameSessionRepository,
    CreateGameSessionHandler,
    ProgressGameSessionHandler,
  ],
})
export class GameSessionModule {}
