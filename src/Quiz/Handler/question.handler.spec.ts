import { QuestionHandler } from './question.handler';
import { QuestionRepository } from '../Repository/question.repository';
import { CreateUpdateQuestionDTO } from '../DTO/create-update-question.dto';
import { ConflictException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

describe('CreateUpdateQuestionHandler', () => {
  let handler: QuestionHandler;

  const questionWithAnswers = {
    id: '123',
    userId: '111',
    categoryId: '222',
    text: 'Test Question',
    answers: [
      {
        questionId: '123',
        text: 'Oh Yes',
        order: 1,
      },
      {
        questionId: '123',
        text: 'Correct Answer',
        order: 2,
      },
      {
        questionId: '123',
        text: 'Oh No',
        order: null,
      },
      {
        questionId: '123',
        text: 'Definitely No',
        order: null,
      },
    ],
  };

  const repositoryMock = {
    fetchByIdAndCategory: jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValue(JSON.parse(JSON.stringify(questionWithAnswers))),

    fetchByTextAndCategory: jest
      .fn()
      .mockResolvedValueOnce(JSON.parse(JSON.stringify(questionWithAnswers)))
      .mockResolvedValue(null),

    updateQuestion: jest.fn().mockResolvedValue({ test: true }),
    createQuestion: jest.fn().mockResolvedValue({ test: true }),
    deleteQuestion: jest.fn().mockResolvedValue({ test: true }),
  };

  beforeEach(() => {
    handler = new QuestionHandler(
      repositoryMock as unknown as QuestionRepository,
    );
  });

  describe('deleteQuestion', () => {
    it('deletes question', async () => {
      await handler.deleteQuestion('222', '123');

      expect(repositoryMock['fetchByIdAndCategory']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['deleteQuestion']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['deleteQuestion']).toHaveBeenCalledWith('456');
    });

    it('throws exception because question does not exist', async () => {
      await expect(handler.deleteQuestion('123', '456')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateQuestion', () => {
    it('throws an exception on non-existing question update', async () => {
      await expect(
        handler.updateQuestion(
          '123',
          '456',
          {} as unknown as CreateUpdateQuestionDTO,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('throws exception on multiple answers with same text', async () => {
      const dto = plainToClass(CreateUpdateQuestionDTO, {
        text: 'Updated Question',
        answers: [
          {
            text: 'Correct Answer',
            order: 1,
            isCorrectAnswer: true,
          },
          {
            text: 'Correct Answer',
            order: 2,
            isCorrectAnswer: false,
          },
        ],
      });

      await expect(handler.updateQuestion('123', '222', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws exception on multiple correct answers', async () => {
      const dto = plainToClass(CreateUpdateQuestionDTO, {
        text: 'Updated Question',
        answers: [
          {
            text: 'Correct Answer',
            order: 1,
            isCorrectAnswer: true,
          },
          {
            text: 'Also Correct',
            order: 2,
            isCorrectAnswer: true,
          },
        ],
      });

      await expect(handler.updateQuestion('123', '222', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('updates question correctly', async () => {
      const dto = plainToClass(CreateUpdateQuestionDTO, {
        text: 'Updated Question',
        answers: [
          {
            text: 'Correct Answer',
            order: 1,
            isCorrectAnswer: true,
          },
        ],
      });

      const result = await handler.updateQuestion('123', '222', dto);

      expect(repositoryMock['updateQuestion']).toHaveBeenCalledTimes(1);

      expect(repositoryMock['updateQuestion']).toHaveBeenCalledWith('123', {
        text: dto.text,
        answers: [
          {
            text: 'Correct Answer',
            order: 1,
            isCorrectAnswer: true,
            id: expect.any(String),
          },
        ],
        correctAnswer: expect.any(String),
      });

      expect(result).toEqual({ test: true });
    });
  });

  describe('createQuestion', () => {
    it('throws exception on similar existing question', async () => {
      const dto = plainToClass(CreateUpdateQuestionDTO, {
        text: 'Test Question',
        answers: [
          {
            text: 'Correct Answer',
            order: 1,
            isCorrectAnswer: true,
          },
        ],
      });

      await expect(handler.createQuestion('222', '222', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates question', async () => {
      const dto = plainToClass(CreateUpdateQuestionDTO, {
        text: 'New Question',
        answers: [
          {
            text: 'New Correct Answer',
            order: 1,
            isCorrectAnswer: true,
          },
        ],
      });

      await handler.createQuestion('222', '222', dto);

      expect(repositoryMock['createQuestion']).toHaveBeenCalledTimes(1);

      expect(repositoryMock['createQuestion']).toHaveBeenCalledWith(
        '222',
        '222',
        {
          text: dto.text,
          answers: [
            {
              text: 'New Correct Answer',
              order: 1,
              isCorrectAnswer: true,
              id: expect.any(String),
            },
          ],
          correctAnswer: expect.any(String),
        },
      );
    });
  });
});
