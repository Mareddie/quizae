import { Prisma } from '@prisma/client';

export type GameWithPlayers = Prisma.GameGetPayload<{
  include: { players: true };
}>;
