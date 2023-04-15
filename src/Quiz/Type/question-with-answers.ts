import { Prisma } from '@prisma/client';

export type QuestionWithAnswers = Prisma.QuestionGetPayload<{
  include: { answers: true };
}>;

export type QuestionCountByCategory = Prisma.QuestionCategoryGetPayload<{
  select: {
    id: true;
    name: true;
    order: true;
    _count: {
      select: {
        questions: true;
      };
    };
  };
}>;
