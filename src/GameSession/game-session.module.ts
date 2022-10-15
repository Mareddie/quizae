import { Module } from '@nestjs/common';
import { GameSessionRepository } from './Repository/game-session.repository';
import { CreateGameSessionHandler } from './Handler/create-game-session.handler';
import { CommonModule } from '../Common/common.module';

@Module({
  imports: [CommonModule],
  exports: [GameSessionRepository, CreateGameSessionHandler],
  providers: [GameSessionRepository, CreateGameSessionHandler],
})
export class GameSessionModule {}
