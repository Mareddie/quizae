import { PrismaClient } from '@prisma/client';

export default async () => {
  const client = new PrismaClient();

  const deletedUsers = await client.user.deleteMany({});
};
