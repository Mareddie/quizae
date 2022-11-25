import { CreateUpdateGroupHandler } from './create-update-group.handler';
import { GroupRepository } from '../Repository/group.repository';
import { UserRepository } from '../Repository/user.repository';
import { plainToClass } from 'class-transformer';
import { CreateUpdateGroupDTO } from '../DTO/create-update-group.dto';
import { ConflictException } from '@nestjs/common';

describe('CreateUpdateGroupHandler', () => {
  const groupRepositoryMock = {
    findByIdAndOwner: jest.fn().mockResolvedValueOnce(null).mockResolvedValue({
      id: '111',
      name: 'My Group',
      ownerId: '123',
    }),
    findByNameForOwner: jest
      .fn()
      .mockResolvedValueOnce([
        {
          id: '111',
          name: 'My Group',
          ownerId: '123',
        },
      ])
      .mockResolvedValue([]),
    updateGroup: jest.fn().mockResolvedValue({ test: true }),
    createGroup: jest.fn().mockResolvedValue({ test: true }),
  };

  const userRepositoryMock = {
    getUserIdsByEmails: jest.fn().mockResolvedValue([
      {
        id: '789',
        email: 'tester1@test.com',
      },
      {
        id: '456',
        email: 'tester2@test.com',
      },
    ]),
  };

  let handler: CreateUpdateGroupHandler;

  beforeEach(() => {
    handler = new CreateUpdateGroupHandler(
      groupRepositoryMock as unknown as GroupRepository,
      userRepositoryMock as unknown as UserRepository,
    );
  });

  describe('updateGroup', () => {
    it('throws exception on non-owned group', async () => {
      const dto = plainToClass(CreateUpdateGroupDTO, {
        name: 'Some Name',
      });

      await expect(handler.updateGroup(dto, '222', '123')).rejects.toThrow(
        ConflictException,
      );

      expect(groupRepositoryMock['updateGroup']).not.toHaveBeenCalled();
    });

    it('updates group with users', async () => {
      const dto = plainToClass(CreateUpdateGroupDTO, {
        name: 'Some Name',
        users: ['tester1@test.com', 'tester2@test.com'],
      });

      await handler.updateGroup(dto, '111', '123');

      expect(groupRepositoryMock['updateGroup']).toHaveBeenCalledWith(
        dto,
        '111',
        [
          {
            id: '789',
            email: 'tester1@test.com',
          },
          {
            id: '456',
            email: 'tester2@test.com',
          },
        ],
      );
    });

    it('updates group without members', async () => {
      const dto = plainToClass(CreateUpdateGroupDTO, {
        name: 'Some Name',
      });

      await handler.updateGroup(dto, '111', '123');

      expect(groupRepositoryMock['updateGroup']).toHaveBeenCalledWith(
        dto,
        '111',
      );
    });
  });

  describe('createGroup', () => {
    it('throws exception on existing group name', async () => {
      const dto = plainToClass(CreateUpdateGroupDTO, {
        name: 'My Group',
      });

      await expect(handler.createGroup(dto, '123')).rejects.toThrow(
        ConflictException,
      );

      expect(groupRepositoryMock['createGroup']).not.toHaveBeenCalled();
    });

    it('creates group with members', async () => {
      const dto = plainToClass(CreateUpdateGroupDTO, {
        name: 'Some Name',
        users: ['tester1@test.com', 'tester2@test.com'],
      });

      await handler.createGroup(dto, '123');

      expect(groupRepositoryMock['createGroup']).toHaveBeenCalledWith(
        dto,
        '123',
        [
          {
            id: '789',
            email: 'tester1@test.com',
          },
          {
            id: '456',
            email: 'tester2@test.com',
          },
        ],
      );
    });

    it('creates group without members', async () => {
      const dto = plainToClass(CreateUpdateGroupDTO, {
        name: 'Some Name',
      });

      await handler.createGroup(dto, '123');

      expect(groupRepositoryMock['createGroup']).toHaveBeenCalledWith(
        dto,
        '123',
      );
    });
  });
});
