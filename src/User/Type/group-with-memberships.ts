import { Prisma } from '@prisma/client';

export type GroupWithMemberships = Prisma.GroupGetPayload<{
  include: { userMemberships: true };
}>;
