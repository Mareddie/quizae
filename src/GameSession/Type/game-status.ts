import { GameState, Player } from '@prisma/client';

export interface GameStatus {
  id: string;
  startedById: string;
  state: GameState;
  currentPlayerId: string;
  nextPlayerId: string;
  players: Player[];
  categoryStatuses: CategoryStatus[];
  startedAt: Date;
}

export interface CategoryStatus {
  id: string;
  name: string;
  order: number;
  questionCount: number;
}
