import { GameWithPlayers } from '../../../GameSession/Type/game-with-players';
import { QuestionCountByCategory } from '../../../Quiz/Type/question-with-answers';

export type GameInfo = {
  info: GameWithPlayers;
  categories?: QuestionCountByCategory[];
};

export type PlayerTurns = {
  currentPlayerId: string | null;
  nextPlayerId: string | null;
};
