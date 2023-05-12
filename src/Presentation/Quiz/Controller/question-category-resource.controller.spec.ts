import { QuestionCategoryResourceController } from './question-category-resource.controller';
import { Test } from '@nestjs/testing';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { QuestionCategoryHandler } from '../../../Quiz/Handler/question-category.handler';
import { plainToClass } from 'class-transformer';
import { CreateUpdateQuestionCategoryDTO } from '../../../Quiz/DTO/create-update-question-category.dto';
import { getMockedAuthRequest } from '../../../../test/testUtils';

describe('QuestionCategoryResourceController', () => {
  let controller: QuestionCategoryResourceController;

  const repositoryMock = {
    fetchForUser: jest.fn().mockResolvedValue([{ test: true }]),
  };

  const handlerMock = {
    createQuestionCategory: jest.fn().mockResolvedValue({ test: true }),
    updateQuestionCategory: jest.fn().mockResolvedValue({ test: true }),
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
          case QuestionCategoryHandler:
            return handlerMock;
          default:
            throw new Error(`Undefined token for mocking: ${String(token)}`);
        }
      })
      .compile();

    controller = moduleRef.get(QuestionCategoryResourceController);
  });

  describe('resourceList', () => {
    it('fetches categories for group', async () => {
      const listData = await controller.resourceList(getMockedAuthRequest());

      expect(listData).toEqual([{ test: true }]);

      expect(repositoryMock['fetchForUser']).toHaveBeenCalledTimes(1);
      expect(repositoryMock['fetchForUser']).toHaveBeenCalledWith('1');
    });
  });

  describe('createResource', () => {
    it('creates question category', async () => {
      const dto = plainToClass(CreateUpdateQuestionCategoryDTO, {
        name: 'Test Category',
        order: 1,
      });

      const createdCategory = await controller.createResource(
        getMockedAuthRequest(),
        dto,
      );

      expect(createdCategory).toEqual({ test: true });

      expect(handlerMock['createQuestionCategory']).toHaveBeenCalledTimes(1);

      expect(handlerMock['createQuestionCategory']).toHaveBeenCalledWith(
        '1',
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
        getMockedAuthRequest(),
        '456',
        dto,
      );

      expect(updatedCategory).toEqual({ test: true });

      expect(handlerMock['updateQuestionCategory']).toHaveBeenCalledTimes(1);

      expect(handlerMock['updateQuestionCategory']).toHaveBeenCalledWith(
        '456',
        '1',
        dto,
      );
    });
  });

  describe('deleteResource', () => {
    it('deletes question category', async () => {
      await controller.deleteResource(getMockedAuthRequest(), '456');

      expect(handlerMock['deleteQuestionCategory']).toHaveBeenCalledTimes(1);

      expect(handlerMock['deleteQuestionCategory']).toHaveBeenCalledWith(
        '1',
        '456',
      );
    });
  });
});
