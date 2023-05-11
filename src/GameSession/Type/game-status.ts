import { GameState, Player } from '@prisma/client';

export interface GameStatus {
  info: {
    id: string;
    startedById: string;
    state: GameState;
    startedAt: Date;
    players: Player[];
    currentPlayerId: string;
    nextPlayerId: string;
  };
  categories: CategoryStatus[];
}

export interface CategoryStatus {
  id: string;
  name: string;
  priority: number;
  _count: {
    questions: number;
  };
}
