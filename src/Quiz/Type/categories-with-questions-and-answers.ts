import { Prisma } from '@prisma/client';

export type CategoriesWithQuestionsAndAnswers =
  Prisma.QuestionCategoryGetPayload<{
    include: {
      questions: {
        include: {
          answers: true;
        };
      };
    };
  }>;
