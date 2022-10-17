import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GameSessionRepository } from '../../../GameSession/Repository/game-session.repository';

@Injectable()
export class CanAccessGameGuard implements CanActivate {
  constructor(private readonly gameRepository: GameSessionRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user['id'];
    const gameId = request.params.gameId;

    if (userId === undefined || gameId === undefined) {
      return false;
    }

    const availableGames = await this.gameRepository.fetchForUser(userId);

    return availableGames.some((gameSession) => gameSession.id === gameId);
  }
}
