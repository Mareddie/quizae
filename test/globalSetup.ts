import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';

export default async () => {
  // If database config isn't present on runtime, e.g. on local environment, set it manually from test dotenv
  if (process.env.DATABASE_URL === undefined) {
    dotenv.config({ path: './.env.test' });
  }

  const client = new PrismaClient();
  const testPassword = await argon2.hash('testing');

  // Prepare global testing data - this User can be used for general authentication purposes
  await client.user.create({
    data: {
      email: 'tester@runner.test',
      password: testPassword,
      firstName: 'Tester',
      lastName: 'Testerovic',
    },
  });
};
