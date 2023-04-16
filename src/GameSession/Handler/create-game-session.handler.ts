import { Injectable } from '@nestjs/common';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { CreatedGameWithPlayers } from '../Type/created-game-with-players';
import { QuestionWithAnswers } from '../../Quiz/Type/question-with-answers';

@Injectable()
export class CreateGameSessionHandler {
  constructor(private readonly gameSessionRepository: GameSessionRepository) {}

  async createGame(
    ownerId: string,
    players: InitGameSessionPlayerDTO[],
  ): Promise<CreatedGameWithPlayers> {
    return this.gameSessionRepository.createGame(ownerId, players);
  }

  // Don't delete this method yet - it might become useful later
  private isQuestionValidForGame(question: QuestionWithAnswers): boolean {
    if (
      question.correctAnswer === null ||
      question.correctAnswer === undefined ||
      question.correctAnswer === ''
    ) {
      return false;
    }

    // The Question is valid only if it has EXACTLY ONE correct answer
    if (question.answers.length === 0) {
      return false;
    }

    return (
      question.answers.filter((answer) => answer.id === question.correctAnswer)
        .length === 1
    );
  }
}
