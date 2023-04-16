import { Prisma } from '@prisma/client';

export type QuestionWithAnswers = Prisma.QuestionGetPayload<{
  include: { answers: true };
}>;

export type QuestionCountByCategory = Prisma.QuestionCategoryGetPayload<{
  select: {
    id: true;
    name: true;
    priority: true;
    _count: {
      select: {
        questions: true;
      };
    };
  };
}>;

export type QuestionCandidateForGame = Prisma.QuestionGetPayload<{
  select: {
    id: true;
    text: true;
    answers: {
      select: {
        id: true;
        text: true;
        priority: true;
      };
      orderBy: {
        priority: 'desc';
      };
    };
  };
}>;
