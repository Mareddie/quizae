import { DeleteGroupHandler } from './delete-group.handler';
import { GroupRepository } from '../Repository/group.repository';
import { ConflictException } from '@nestjs/common';

describe('DeleteGroupHandler', () => {
  const repositoryMock = {
    findByIdAndOwner: jest.fn().mockResolvedValueOnce(null).mockResolvedValue({
      id: '123',
      name: 'Test',
    }),

    deleteGroup: jest.fn().mockResolvedValue({ test: true }),
  };

  let handler: DeleteGroupHandler;

  beforeEach(() => {
    handler = new DeleteGroupHandler(
      repositoryMock as unknown as GroupRepository,
    );
  });

  describe('deleteGroup', () => {
    it('throws error on invalid group found', async () => {
      await expect(handler.deleteGroup('456', '123')).rejects.toThrow(
        ConflictException,
      );

      expect(repositoryMock['deleteGroup']).not.toHaveBeenCalled();
    });

    it('deletes group', async () => {
      await handler.deleteGroup('123', '123');

      expect(repositoryMock['deleteGroup']).toHaveBeenCalledWith('123');
    });
  });
});
