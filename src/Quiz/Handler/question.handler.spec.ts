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
        priority: 1,
        isCorrect: false,
      },
      {
        questionId: '123',
        text: 'Correct Answer',
        priority: 2,
        isCorrect: true,
      },
      {
        questionId: '123',
        text: 'Oh No',
        priority: null,
        isCorrect: false,
      },
      {
        questionId: '123',
        text: 'Definitely No',
        priority: null,
        isCorrect: false,
      },
    ],
  };

  const repositoryMock = {
    fetchByIdAndCategory: jest
      .fn()
      .mockResolvedValue(JSON.parse(JSON.stringify(questionWithAnswers))),

    fetchByTextAndCategory: jest.fn().mockResolvedValue(null),

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
    it('throws exception because question does not exist', async () => {
      repositoryMock['fetchByIdAndCategory'].mockResolvedValueOnce(null);

      await expect(handler.deleteQuestion('123', '456')).rejects.toThrow(
        ConflictException,
      );
    });

    it('deletes question', async () => {
      await handler.deleteQuestion('222', '123');

      expect(repositoryMock['fetchByIdAndCategory']).toHaveBeenCalledTimes(2);
      expect(repositoryMock['deleteQuestion']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['deleteQuestion']).toHaveBeenCalledWith('123');
    });
  });

  describe('updateQuestion', () => {
    it('throws an exception on non-existing question update', async () => {
      repositoryMock['fetchByIdAndCategory'].mockResolvedValueOnce(null);

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
            priority: 1,
            isCorrect: true,
          },
          {
            text: 'Correct Answer',
            priority: 2,
            isCorrect: false,
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
            priority: 1,
            isCorrect: true,
          },
          {
            text: 'Also Correct',
            priority: 2,
            isCorrect: true,
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
            priority: 1,
            isCorrect: true,
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
            priority: 1,
            isCorrect: true,
          },
        ],
      });

      expect(result).toEqual({ test: true });
    });
  });

  describe('createQuestion', () => {
    it('throws exception on similar existing question', async () => {
      repositoryMock['fetchByTextAndCategory'].mockResolvedValueOnce(
        JSON.parse(JSON.stringify(questionWithAnswers)),
      );

      const dto = plainToClass(CreateUpdateQuestionDTO, {
        text: 'Test Question',
        answers: [
          {
            text: 'Correct Answer',
            priority: 1,
            isCorrect: true,
          },
        ],
      });

      await expect(handler.createQuestion('222', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates question', async () => {
      const dto = plainToClass(CreateUpdateQuestionDTO, {
        text: 'New Question',
        answers: [
          {
            text: 'New Correct Answer',
            priority: 1,
            isCorrect: true,
          },
        ],
      });

      await handler.createQuestion('222', dto);

      expect(repositoryMock['createQuestion']).toHaveBeenCalledTimes(1);

      expect(repositoryMock['createQuestion']).toHaveBeenCalledWith('222', {
        text: dto.text,
        answers: [
          {
            text: 'New Correct Answer',
            priority: 1,
            isCorrect: true,
          },
        ],
      });
    });
  });
});
