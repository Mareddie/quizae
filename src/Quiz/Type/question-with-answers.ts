import { Prisma } from '@prisma/client';

export type QuestionWithAnswers = Prisma.QuestionGetPayload<{
  include: { answers: true };
}>;
