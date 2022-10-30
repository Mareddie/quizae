import { GameQuestionAnswer } from '@prisma/client';

export interface QuestionForGame {
  id: string;
  categoryId: string;
  answers: GameQuestionAnswer[];
  text: string;
}
