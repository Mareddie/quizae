import { GroupResourceController } from './group-resource.controller';
import { Test } from '@nestjs/testing';
import { GroupRepository } from '../../../User/Repository/group.repository';
import { CreateUpdateGroupHandler } from '../../../User/Handler/create-update-group.handler';
import { LeaveGroupHandler } from '../../../User/Handler/leave-group.handler';
import { DeleteGroupHandler } from '../../../User/Handler/delete-group.handler';
import { getMockedAuthRequest } from '../../../../test/testUtils';
import { CreateUpdateGroupDTO } from '../../../User/DTO/create-update-group.dto';

describe('GroupResourceController', () => {
  let controller: GroupResourceController;

  const groupRepositoryMock = {
    findGroupsForUser: jest.fn().mockResolvedValue([{ test: true }]),
  };

  const createUpdateHandlerMock = {
    createGroup: jest.fn().mockResolvedValue([{ test: true }]),
    updateGroup: jest.fn().mockResolvedValue([{ test: true }]),
  };

  const deleteGroupHandlerMock = {
    deleteGroup: jest.fn().mockResolvedValue([{ test: true }]),
  };

  const leaveGroupHandlerMock = {
    leaveGroup: jest.fn().mockResolvedValue([{ test: true }]),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GroupResourceController],
    })
      .useMocker((token) => {
        if (token === GroupRepository) {
          return groupRepositoryMock;
        }

        if (token === CreateUpdateGroupHandler) {
          return createUpdateHandlerMock;
        }

        if (token === LeaveGroupHandler) {
          return leaveGroupHandlerMock;
        }

        if (token === DeleteGroupHandler) {
          return deleteGroupHandlerMock;
        }
      })
      .compile();

    controller = moduleRef.get(GroupResourceController);
  });

  describe('resourceList', () => {
    it('returns empty list without filter', async () => {
      const resourceList = await controller.resourceList(
        getMockedAuthRequest(),
      );

      expect(resourceList).toEqual([]);
    });

    it('returns filtered groups', async () => {
      const resourceList = await controller.resourceList(
        getMockedAuthRequest(),
        'test',
      );

      expect(groupRepositoryMock['findGroupsForUser']).toHaveBeenCalledTimes(1);

      expect(groupRepositoryMock['findGroupsForUser']).toHaveBeenCalledWith(
        'test',
        '1',
      );

      expect(resourceList).toEqual([{ test: true }]);
    });
  });

  describe('createResource', () => {
    it('creates group', async () => {
      const dto = new CreateUpdateGroupDTO();

      dto.name = 'Ohh yes';

      const createResponse = await controller.createResource(
        dto,
        getMockedAuthRequest(),
      );

      expect(createUpdateHandlerMock['createGroup']).toHaveBeenCalledTimes(1);

      expect(createUpdateHandlerMock['createGroup']).toHaveBeenCalledWith(
        dto,
        '1',
      );

      expect(createResponse).toEqual([{ test: true }]);
    });
  });

  describe('updateResource', () => {
    it('updates group', async () => {
      const dto = new CreateUpdateGroupDTO();

      dto.users = ['test@test.com', 'ohyes@test.com'];
      dto.name = 'Updated Group';

      const updateResponse = await controller.updateResource(
        '123',
        dto,
        getMockedAuthRequest(),
      );

      expect(createUpdateHandlerMock['updateGroup']).toHaveBeenCalledTimes(1);

      expect(createUpdateHandlerMock['updateGroup']).toHaveBeenCalledWith(
        dto,
        '123',
        '1',
      );

      expect(updateResponse).toEqual([{ test: true }]);
    });
  });

  describe('deleteResource', () => {
    it('deletes group', async () => {
      await controller.deleteResource('123', getMockedAuthRequest());

      expect(deleteGroupHandlerMock['deleteGroup']).toHaveBeenCalledTimes(1);

      expect(deleteGroupHandlerMock['deleteGroup']).toHaveBeenCalledWith(
        '123',
        '1',
      );
    });
  });

  describe('leaveGroup', () => {
    it('leaves group', async () => {
      await controller.leaveGroup('123', getMockedAuthRequest());

      expect(leaveGroupHandlerMock['leaveGroup']).toHaveBeenCalledTimes(1);

      expect(leaveGroupHandlerMock['leaveGroup']).toHaveBeenCalledWith(
        '123',
        '1',
      );
    });
  });
});
