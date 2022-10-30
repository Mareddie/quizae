import { Prisma } from '@prisma/client';

export type FinishedGameResult = Prisma.GameGetPayload<{
  select: {
    id: true;
    state: true;
    players: true;
  };
}>;
