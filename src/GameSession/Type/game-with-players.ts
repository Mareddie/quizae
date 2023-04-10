import { Prisma } from '@prisma/client';

export type GameWithPlayers = Prisma.GameGetPayload<{
  select: {
    id: true;
    startedById: true;
    state: true;
    startedAt: true;
    players: true;
    currentPlayerId: true;
    nextPlayerId: true;
  };
}>;
