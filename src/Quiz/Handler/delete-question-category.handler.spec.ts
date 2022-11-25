import { DeleteQuestionCategoryHandler } from './delete-question-category.handler';
import { QuestionCategoryRepository } from '../Repository/question-category.repository';
import { ConflictException } from '@nestjs/common';

describe('DeleteQuestionCategoryHandler', () => {
  let handler: DeleteQuestionCategoryHandler;

  const repositoryMock = {
    fetchById: jest.fn().mockResolvedValue({
      id: '123',
      groupId: '123',
      name: 'Some Question Category',
    }),
    deleteQuestionCategory: jest.fn().mockResolvedValue({ test: true }),
  };

  beforeEach(() => {
    handler = new DeleteQuestionCategoryHandler(
      repositoryMock as unknown as QuestionCategoryRepository,
    );
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
});
