import { Injectable } from '@nestjs/common';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { CreatedGameWithPlayers } from '../Type/created-game-with-players';
import { QuestionWithAnswers } from '../../Quiz/Type/question-with-answers';
import { ReorderService } from '../../Common/Service/reorder.service';

@Injectable()
export class CreateGameSessionHandler {
  constructor(
    private readonly gameSessionRepository: GameSessionRepository,
    private readonly reorderService: ReorderService,
  ) {}

  async createGame(
    ownerId: string,
    players: InitGameSessionPlayerDTO[],
  ): Promise<CreatedGameWithPlayers> {
    // Ensure that the order of players is correct
    players.sort((a, b) =>
      this.reorderService.reorderWithNull(a.order, b.order),
    );

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
