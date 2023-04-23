import { ConflictException, Injectable } from '@nestjs/common';
import { ProgressGameRequestDTO } from '../DTO/progress-game-request.dto';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { ReorderService } from '../../Common/Service/reorder.service';
import { FinishedGameResult } from '../Type/finished-game-result';
import { GameWithPlayers } from '../Type/game-with-players';
import { GameState, Player } from '@prisma/client';
import { QuestionForGameProgress } from '../../Quiz/Type/question-with-answers';

@Injectable()
export class ProgressGameSessionHandler {
  private correctAnswerPoints = 10;

  constructor(
    private readonly gameRepository: GameSessionRepository,
    private readonly reorderService: ReorderService,
  ) {}

  async endGame(gameId: string): Promise<FinishedGameResult> {
    return this.gameRepository.endGame(gameId);
  }

  async progressGame(
    questionData: QuestionForGameProgress,
    requestData: ProgressGameRequestDTO,
    gameId: string,
  ): Promise<void> {
    const gameData = await this.gameRepository.fetchById(gameId);

    this.checkGameState(gameData);
    this.checkCurrentPlayer(requestData, gameData);

    const selectedPlayer = this.determinePlayer(gameData, requestData);

    // TODO: implement question resolution

    // const returnData = {
    //   answeredCorrectly: false,
    //   correctAnswerId: selectedQuestion.correctAnswer,
    // };
    //
    // // If the player guessed correctly, add points
    // if (selectedQuestion.correctAnswer === requestData.answerId) {
    //   returnData.answeredCorrectly = true;
    //   selectedPlayer.points = selectedPlayer.points + this.correctAnswerPoints;
    // }
    //
    // this.updateGameDataAfterProgress(
    //   gameData,
    //   requestData.categoryId,
    //   selectedQuestion,
    // );
    //
    // this.updateGamePlayerTurns(gameData);
    //
    // await this.gameRepository.updateGameDataAfterProgress(
    //   gameData,
    //   selectedPlayer,
    // );
    //
    // return returnData;
  }

  private checkGameState(gameData: GameWithPlayers): void {
    if (gameData.state !== GameState.IN_PROGRESS) {
      throw new ConflictException(
        'The game needs to be in progress if there are any updates.',
      );
    }
  }

  private checkCurrentPlayer(
    progressData: ProgressGameRequestDTO,
    gameData: GameWithPlayers,
  ): void {
    if (gameData.currentPlayerId !== progressData.playerId) {
      throw new ConflictException("It's not a provided player's turn");
    }
  }

  private determinePlayer(
    gameData: GameWithPlayers,
    requestData: ProgressGameRequestDTO,
  ): Player {
    const selectedPlayer = gameData.players.find(
      (player) => player.id === requestData.playerId,
    );

    // This is a sanity check and should never happen
    if (selectedPlayer === undefined) {
      throw new ConflictException('Provided Player was not found in the Game');
    }

    return selectedPlayer;
  }

  private updateGamePlayerTurns(gameData: GameWithPlayers): void {
    gameData.players.sort((a, b) =>
      this.reorderService.reorderWithNull(a.order, b.order),
    );

    const nextPlayerIndex = gameData.players.findIndex(
      (player) => player.id === gameData.nextPlayerId,
    );

    gameData.currentPlayerId = gameData.nextPlayerId;

    // If the next guessed Player index doesn't exist, the next player is the first in order
    gameData.nextPlayerId =
      nextPlayerIndex + 1 > gameData.players.length - 1
        ? gameData.players[0].id
        : gameData.players[nextPlayerIndex + 1].id;
  }
  //
  // private updateGameDataAfterProgress(
  //   gameData: GameWithPlayers,
  //   categoryId: string,
  //   selectedQuestion: GameQuestion,
  // ): void {
  //   const categoryIndex = gameData.questionCategories.findIndex(
  //     (category) => category.id === categoryId,
  //   );
  //
  //   // We want to delete the question that was answered from game dataset
  //   gameData.questionCategories[categoryIndex].questions =
  //     gameData.questionCategories[categoryIndex].questions.filter(
  //       (question) => question.id !== selectedQuestion.id,
  //     );
  // }
}
