import { QuestionCategoryResourceController } from './question-category-resource.controller';
import { Test } from '@nestjs/testing';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { CreateUpdateQuestionCategoryHandler } from '../../../Quiz/Handler/create-update-question-category.handler';
import { DeleteQuestionCategoryHandler } from '../../../Quiz/Handler/delete-question-category.handler';
import { plainToClass } from 'class-transformer';
import { CreateUpdateQuestionCategoryDTO } from '../../../Quiz/DTO/create-update-question-category.dto';

describe('QuestionCategoryResourceController', () => {
  let controller: QuestionCategoryResourceController;

  const repositoryMock = {
    fetchForGroup: jest.fn().mockResolvedValue([{ test: true }]),
  };

  const handlerMock = {
    createQuestionCategory: jest.fn().mockResolvedValue({ test: true }),
    updateQuestionCategory: jest.fn().mockResolvedValue({ test: true }),
  };

  const deleteHandlerMock = {
    deleteQuestionCategory: jest.fn().mockResolvedValue({ test: true }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [QuestionCategoryResourceController],
    })
      .useMocker((token) => {
        switch (token) {
          case QuestionCategoryRepository:
            return repositoryMock;
          case CreateUpdateQuestionCategoryHandler:
            return handlerMock;
          case DeleteQuestionCategoryHandler:
            return deleteHandlerMock;
          default:
            throw new Error(`Undefined token for mocking: ${String(token)}`);
        }
      })
      .compile();

    controller = moduleRef.get(QuestionCategoryResourceController);
  });

  describe('resourceList', () => {
    it('fetches categories for group', async () => {
      const listData = await controller.resourceList('123');

      expect(listData).toEqual([{ test: true }]);

      expect(repositoryMock['fetchForGroup']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['fetchForGroup']).toHaveBeenCalledWith('123');
    });
  });

  describe('createResource', () => {
    it('creates question category', async () => {
      const dto = plainToClass(CreateUpdateQuestionCategoryDTO, {
        name: 'Test Category',
        order: 1,
      });

      const createdCategory = await controller.createResource('123', dto);

      expect(createdCategory).toEqual({ test: true });

      expect(handlerMock['createQuestionCategory']).toHaveBeenCalledTimes(1);

      expect(handlerMock['createQuestionCategory']).toHaveBeenCalledWith(
        '123',
        dto,
      );
    });
  });

  describe('updateResource', () => {
    it('updates question category', async () => {
      const dto = plainToClass(CreateUpdateQuestionCategoryDTO, {
        name: 'Test Category Update',
        order: 1,
      });

      const updatedCategory = await controller.updateResource(
        '123',
        '456',
        dto,
      );

      expect(updatedCategory).toEqual({ test: true });

      expect(handlerMock['updateQuestionCategory']).toHaveBeenCalledTimes(1);

      expect(handlerMock['updateQuestionCategory']).toHaveBeenCalledWith(
        '456',
        '123',
        dto,
      );
    });
  });

  describe('deleteResource', () => {
    it('deletes question category', async () => {
      await controller.deleteResource('123', '456');

      expect(deleteHandlerMock['deleteQuestionCategory']).toHaveBeenCalledTimes(
        1,
      );

      expect(deleteHandlerMock['deleteQuestionCategory']).toHaveBeenCalledWith(
        '123',
        '456',
      );
    });
  });
});
