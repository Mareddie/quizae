import { CreateGameSessionHandler } from './create-game-session.handler';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { ReorderService } from '../../Common/Service/reorder.service';
import { ConflictException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';
import { CategoriesWithQuestionsAndAnswers } from '../../Quiz/Type/categories-with-questions-and-answers';

describe('CreateGameSessionHandler', () => {
  let handler: CreateGameSessionHandler;

  const repositoryMock = {
    createGame: jest.fn().mockResolvedValue({ test: true }),
  };

  beforeEach(() => {
    handler = new CreateGameSessionHandler(
      repositoryMock as unknown as GameSessionRepository,
      new ReorderService(),
    );
  });

  describe('createGame', () => {
    it('throws exception on empty category questions', async () => {
      await expect(handler.createGame('123', [], [])).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates game', async () => {
      const categoriesWithQuestionsAndAnswers = [
        {
          id: '333',
          name: 'Empty Category',
          groupId: '111',
          order: 3,
          questions: [],
        },
        {
          id: '444',
          name: 'Category with Invalid Questions',
          groupId: '111',
          order: 2,
          questions: [
            {
              id: '2',
              userId: '123',
              categoryId: '333',
              correctAnswer: undefined,
              text: 'No Question, No Answers',
              answers: [],
            },
            {
              id: '3',
              userId: '123',
              categoryId: '333',
              correctAnswer: '333',
              text: 'Correct Answer, No Answers',
              answers: [],
            },
          ],
        },
        {
          groupId: '111',
          id: '999',
          name: 'Some Category',
          order: 1,
          questions: [
            {
              id: '1',
              categoryId: '999',
              correctAnswer: '2',
              text: 'How much is 4x4?',
              userId: '123',
              answers: [
                {
                  id: '3',
                  questionId: '1',
                  text: 'I do not know',
                  order: 1,
                },
                {
                  id: '4',
                  questionId: '1',
                  text: '20',
                  order: 2,
                },
                {
                  id: '2',
                  questionId: '1',
                  text: '16',
                  order: 3,
                },
                {
                  id: '1',
                  questionId: '1',
                  text: '9',
                  order: 4,
                },
              ],
            },
          ],
        },
      ];

      const players = [
        plainToClass(InitGameSessionPlayerDTO, {
          name: 'Matt',
          order: 1,
        }),
        plainToClass(InitGameSessionPlayerDTO, {
          name: 'Diva',
          order: 2,
        }),
      ];

      const createdGame = await handler.createGame(
        '123',
        JSON.parse(
          JSON.stringify(categoriesWithQuestionsAndAnswers),
        ) as unknown as CategoriesWithQuestionsAndAnswers[],
        players,
      );

      expect(createdGame).toMatchObject({ test: true });
      expect(repositoryMock['createGame']).toHaveBeenCalledTimes(1);

      expect(repositoryMock['createGame']).toHaveBeenCalledWith(
        '123',
        [
          {
            id: '999',
            name: 'Some Category',
            order: 1,
            questions: [
              {
                id: '1',
                categoryId: '999',
                correctAnswer: '2',
                text: 'How much is 4x4?',
                answers: [
                  {
                    id: '3',
                    questionId: '1',
                    text: 'I do not know',
                    order: 1,
                  },
                  {
                    id: '4',
                    questionId: '1',
                    text: '20',
                    order: 2,
                  },
                  {
                    id: '2',
                    questionId: '1',
                    text: '16',
                    order: 3,
                  },
                  {
                    id: '1',
                    questionId: '1',
                    text: '9',
                    order: 4,
                  },
                ],
              },
            ],
          },
        ],
        players,
      );
    });
  });
});
