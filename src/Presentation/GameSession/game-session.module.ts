import { GameSessionModule as DomainGameSessionModule } from '../../GameSession/game-session.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DomainGameSessionModule],
  controllers: [],
  providers: [],
})
export class GameSessionModule {}
