import { LeaveGroupHandler } from './leave-group.handler';
import { GroupRepository } from '../Repository/group.repository';
import { ConflictException } from '@nestjs/common';

describe('LeaveGroupHandler', () => {
  const repositoryMock = {
    findByIdAndOwner: jest
      .fn()
      .mockResolvedValueOnce({
        id: '123',
        ownerId: '111',
        name: 'Testing Group',
      })
      .mockResolvedValue(null),

    deleteGroupMembership: jest.fn().mockResolvedValue({ test: true }),
  };

  let handler: LeaveGroupHandler;

  beforeEach(() => {
    handler = new LeaveGroupHandler(
      repositoryMock as unknown as GroupRepository,
    );
  });

  describe('leaveGroup', () => {
    it('throws exception on owned group attempt', async () => {
      await expect(handler.leaveGroup('123', '111')).rejects.toThrow(
        ConflictException,
      );

      expect(repositoryMock['deleteGroupMembership']).not.toHaveBeenCalled();
    });

    it('deletes group membership', async () => {
      await handler.leaveGroup('111', '111');

      expect(repositoryMock['deleteGroupMembership']).toHaveBeenCalledWith(
        '111',
        '111',
      );
    });
  });
});
