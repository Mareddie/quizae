import { Module } from '@nestjs/common';
import { GameSessionRepository } from './Repository/game-session.repository';

@Module({
  imports: [],
  exports: [GameSessionRepository],
  providers: [GameSessionRepository],
})
export class GameSessionModule {}
