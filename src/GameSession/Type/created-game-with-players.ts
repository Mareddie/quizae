import { Prisma } from '@prisma/client';

export type CreatedGameWithPlayers = Prisma.GameGetPayload<{
  select: {
    id: true;
    startedById: true;
    state: true;
    startedAt: true;
    currentPlayerId: true;
    nextPlayerId: true;
    players: true;
  };
}>;
