import { GameSessionModule as DomainGameSessionModule } from '../../GameSession/game-session.module';
import { Module } from '@nestjs/common';
import { GameSessionController } from './Controller/game-session.controller';
import { UserModule } from '../../User/user.module';
import { ConfigModule } from '@nestjs/config';
import { QuizModule } from '../../Quiz/quiz.module';

@Module({
  imports: [DomainGameSessionModule, UserModule, ConfigModule, QuizModule],
  controllers: [GameSessionController],
  providers: [],
})
export class GameSessionModule {}
