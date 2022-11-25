import { DeleteQuestionHandler } from './delete-question.handler';
import { QuestionRepository } from '../Repository/question.repository';
import { ConflictException } from '@nestjs/common';

describe('DeleteQuestionHandler', () => {
  let handler: DeleteQuestionHandler;

  const repositoryMock = {
    fetchByIdAndCategory: jest
      .fn()
      .mockResolvedValueOnce({
        id: '456',
        text: 'Existing Question',
      })
      .mockResolvedValue(null),

    deleteQuestion: jest.fn().mockResolvedValue({ test: true }),
  };

  beforeEach(() => {
    handler = new DeleteQuestionHandler(
      repositoryMock as unknown as QuestionRepository,
    );
  });

  describe('deleteQuestion', () => {
    it('deletes question', async () => {
      await handler.deleteQuestion('123', '456');

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
});
