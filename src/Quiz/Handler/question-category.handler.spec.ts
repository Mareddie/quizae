import { QuestionCategoryHandler } from './question-category.handler';
import { QuestionCategoryRepository } from '../Repository/question-category.repository';
import { plainToClass } from 'class-transformer';
import { CreateUpdateQuestionCategoryDTO } from '../DTO/create-update-question-category.dto';
import { ConflictException } from '@nestjs/common';

describe('CreateUpdateQuestionCategoryHandler', () => {
  let handler: QuestionCategoryHandler;

  const repositoryMock = {
    createForGroup: jest.fn().mockResolvedValue({ test: true }),
    updateQuestionCategory: jest.fn().mockResolvedValue({ test: true }),
    fetchForGroup: jest
      .fn()
      .mockResolvedValueOnce([{ id: '123', name: 'test category' }])
      .mockResolvedValue([]),
    fetchById: jest.fn().mockResolvedValue({
      id: '123',
      groupId: '123',
      name: 'Some Question Category',
    }),
    deleteQuestionCategory: jest.fn().mockResolvedValue({ test: true }),
  };

  beforeEach(() => {
    handler = new QuestionCategoryHandler(
      repositoryMock as unknown as QuestionCategoryRepository,
    );

    repositoryMock['fetchForGroup'].mockClear();
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
      const dto = plainToClass(CreateUpdateQuestionCategoryDTO, {
        name: 'Test Category',
        order: 1,
      });

      await expect(handler.createQuestionCategory('111', dto)).rejects.toThrow(
        ConflictException,
      );

      expect(repositoryMock['fetchForGroup']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['fetchForGroup']).toHaveBeenCalledWith(
        '111',
        'Test Category',
      );

      expect(repositoryMock['createForGroup']).not.toHaveBeenCalled();
    });

    it('creates question category', async () => {
      const dto = plainToClass(CreateUpdateQuestionCategoryDTO, {
        name: 'This Is Great',
        order: 1,
      });

      const result = await handler.createQuestionCategory('111', dto);

      expect(repositoryMock['fetchForGroup']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['fetchForGroup']).toHaveBeenCalledWith(
        '111',
        'This Is Great',
      );

      expect(repositoryMock['createForGroup']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['createForGroup']).toHaveBeenCalledWith('111', dto);

      expect(result).toEqual({ test: true });
    });
  });

  describe('updateQuestionCategory', () => {
    it('updates question category', async () => {
      const dto = plainToClass(CreateUpdateQuestionCategoryDTO, {
        name: 'This Is Great Update',
        order: 1,
      });

      const result = await handler.updateQuestionCategory('123', '111', dto);

      expect(repositoryMock['fetchForGroup']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['fetchForGroup']).toHaveBeenCalledWith(
        '111',
        'This Is Great Update',
      );

      expect(repositoryMock['updateQuestionCategory']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['updateQuestionCategory']).toHaveBeenCalledWith(
        '123',
        dto,
      );
    });
  });
});
