import { QuestionCategoryHandler } from './question-category.handler';
import { QuestionCategoryRepository } from '../Repository/question-category.repository';
import { plainToClass } from 'class-transformer';
import { CreateUpdateQuestionCategoryDTO } from '../DTO/create-update-question-category.dto';
import { ConflictException } from '@nestjs/common';

describe('QuestionCategoryHandler', () => {
  let handler: QuestionCategoryHandler;

  const repositoryMock = {
    createForUser: jest.fn().mockResolvedValue({ test: true }),
    updateQuestionCategory: jest.fn().mockResolvedValue({ test: true }),
    fetchForUser: jest.fn().mockResolvedValue([]),
    fetchById: jest.fn().mockResolvedValue({
      id: '123',
      userId: '123',
      name: 'Some Question Category',
    }),
    deleteQuestionCategory: jest.fn().mockResolvedValue({ test: true }),
  };

  beforeEach(() => {
    handler = new QuestionCategoryHandler(
      repositoryMock as unknown as QuestionCategoryRepository,
    );

    repositoryMock['fetchForUser'].mockClear();
  });

  describe('deleteQuestionCategory', () => {
    it('throws exception on invalid question category', async () => {
      await expect(
        handler.deleteQuestionCategory('111', '123'),
      ).rejects.toThrow(ConflictException);

      expect(repositoryMock.deleteQuestionCategory).not.toHaveBeenCalled();
    });

    it('deletes question category', async () => {
      await handler.deleteQuestionCategory('123', '123');

      expect(repositoryMock.deleteQuestionCategory).toHaveBeenCalledWith('123');
    });
  });

  describe('createQuestionCategory', () => {
    it('throws exception on existing similar question category', async () => {
      repositoryMock['fetchForUser'].mockResolvedValueOnce([
        { id: '123', name: 'test category' },
      ]);

      const dto = plainToClass(CreateUpdateQuestionCategoryDTO, {
        name: 'Test Category',
        order: 1,
      });

      await expect(handler.createQuestionCategory('111', dto)).rejects.toThrow(
        ConflictException,
      );

      expect(repositoryMock['fetchForUser']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['fetchForUser']).toHaveBeenCalledWith(
        '111',
        'Test Category',
      );

      expect(repositoryMock['createForUser']).not.toHaveBeenCalled();
    });

    it('creates question category', async () => {
      const dto = plainToClass(CreateUpdateQuestionCategoryDTO, {
        name: 'This Is Great',
        order: 1,
      });

      const result = await handler.createQuestionCategory('111', dto);

      expect(repositoryMock['fetchForUser']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['fetchForUser']).toHaveBeenCalledWith(
        '111',
        'This Is Great',
      );

      expect(repositoryMock['createForUser']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['createForUser']).toHaveBeenCalledWith('111', dto);

      expect(result).toEqual({ test: true });
    });
  });

  describe('updateQuestionCategory', () => {
    it('updates question category', async () => {
      repositoryMock['fetchForUser'].mockResolvedValueOnce([
        { id: '123', name: 'test category' },
      ]);

      const dto = plainToClass(CreateUpdateQuestionCategoryDTO, {
        name: 'This Is Great Update',
        order: 1,
      });

      await handler.updateQuestionCategory('123', '111', dto);

      expect(repositoryMock['fetchForUser']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['fetchForUser']).toHaveBeenCalledWith(
        '111',
        'This Is Great Update',
      );

      expect(repositoryMock['updateQuestionCategory']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['updateQuestionCategory']).toHaveBeenCalledWith(
        '123',
        dto,
      );
    });

    it('resolves potentially unique constraint exception', async () => {
      repositoryMock['fetchForUser'].mockResolvedValueOnce([
        {
          id: '1234',
          name: 'This Is Great Update',
          order: null,
        },
      ]);

      const dto = plainToClass(CreateUpdateQuestionCategoryDTO, {
        name: 'This Is Great Update',
        order: 1,
      });

      await expect(
        handler.updateQuestionCategory('123', '111', dto),
      ).rejects.toThrow(ConflictException);

      expect(repositoryMock['fetchForUser']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['fetchForUser']).toHaveBeenCalledWith(
        '111',
        'This Is Great Update',
      );
    });
  });
});
