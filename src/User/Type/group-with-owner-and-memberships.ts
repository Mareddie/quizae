import { Prisma } from '@prisma/client';

export type GroupWithOwnerAndMemberships = Prisma.GroupGetPayload<{
  include: {
    owner: {
      select: {
        email: true;
      };
    };
    userMemberships: {
      select: {
        user: {
          select: {
            id: true;
            email: true;
          };
        };
      };
    };
  };
}>;
