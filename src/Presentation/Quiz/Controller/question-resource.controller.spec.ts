import { QuestionResourceController } from './question-resource.controller';
import { Test } from '@nestjs/testing';
import { QuestionRepository } from '../../../Quiz/Repository/question.repository';
import { CreateUpdateQuestionHandler } from '../../../Quiz/Handler/create-update-question.handler';
import { DeleteQuestionHandler } from '../../../Quiz/Handler/delete-question.handler';
import { getMockedAuthRequest } from '../../../../test/testUtils';
import { CanAccessCategoryGuard } from '../Guard/can-access-category.guard';
import { CreateUpdateQuestionDTO } from '../../../Quiz/DTO/create-update-question.dto';
import { plainToClass } from 'class-transformer';

describe('QuestionResourceController', () => {
  let controller: QuestionResourceController;

  const questionRepositoryMock = {
    fetchQuestions: jest.fn().mockResolvedValue([{ test: true }]),
  };

  const questionHandlerMock = {
    createQuestion: jest.fn().mockResolvedValue({ test: true }),
    updateQuestion: jest.fn().mockResolvedValue({ test: true }),
  };

  const deleteHandlerMock = {
    deleteQuestion: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [QuestionResourceController],
    })
      .useMocker((token) => {
        switch (token) {
          case QuestionRepository:
            return questionRepositoryMock;
          case CreateUpdateQuestionHandler:
            return questionHandlerMock;
          case DeleteQuestionHandler:
            return deleteHandlerMock;
          default:
            throw new Error(`Undefined token for mocking: ${String(token)}`);
        }
      })
      .overrideGuard(CanAccessCategoryGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(QuestionResourceController);
  });

  describe('resourceList', () => {
    it('fetches my questions', async () => {
      const req = getMockedAuthRequest();

      const questions = await controller.resourceList('123', req, 'myOwn');

      expect(questions).toEqual([{ test: true }]);

      expect(questionRepositoryMock['fetchQuestions']).toHaveBeenCalledTimes(1);

      expect(questionRepositoryMock['fetchQuestions']).toHaveBeenCalledWith(
        '123',
        req.user.id,
      );
    });

    it('fetches questions within category', async () => {
      const req = getMockedAuthRequest();

      const questions = await controller.resourceList('123', req);

      expect(questions).toEqual([{ test: true }]);

      expect(questionRepositoryMock['fetchQuestions']).toHaveBeenCalledTimes(2);

      expect(questionRepositoryMock['fetchQuestions']).toHaveBeenCalledWith(
        '123',
      );
    });
  });

  describe('createResource', () => {
    it('creates question', async () => {
      const req = getMockedAuthRequest();

      const dto = plainToClass(CreateUpdateQuestionDTO, {
        text: 'test question',
        correctAnswer: 'edd',
        answers: [
          {
            text: 'yo boi',
            id: 'edd',
            order: 1,
            isCorrectAnswer: true,
          },
        ],
      });

      const createQuestion = await controller.createResource('123', dto, req);

      expect(createQuestion).toEqual({ test: true });

      expect(questionHandlerMock['createQuestion']).toHaveBeenCalledTimes(1);

      expect(questionHandlerMock['createQuestion']).toHaveBeenCalledWith(
        '123',
        req.user.id,
        dto,
      );
    });
  });

  describe('updateResource', () => {
    it('updates question', async () => {
      const dto = plainToClass(CreateUpdateQuestionDTO, {
        text: 'test question update',
        correctAnswer: 'edda',
        answers: [
          {
            text: 'yo boi',
            id: 'edda',
            order: 1,
            isCorrectAnswer: true,
          },
          {
            text: 'yo mamma',
            id: 'eddae',
            order: 2,
            isCorrectAnswer: false,
          },
        ],
      });

      const updateQuestion = await controller.updateResource('123', '456', dto);

      expect(updateQuestion).toEqual({ test: true });

      expect(questionHandlerMock['updateQuestion']).toHaveBeenCalledTimes(1);

      expect(questionHandlerMock['updateQuestion']).toHaveBeenCalledWith(
        '456',
        '123',
        dto,
      );
    });
  });

  describe('deleteResource', () => {
    it('deletes question', async () => {
      await controller.deleteResource('123', '456');

      expect(deleteHandlerMock['deleteQuestion']).toHaveBeenCalledTimes(1);

      expect(deleteHandlerMock['deleteQuestion']).toHaveBeenCalledWith(
        '123',
        '456',
      );
    });
  });
});
