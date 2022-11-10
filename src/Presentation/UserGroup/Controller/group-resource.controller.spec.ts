import { GroupResourceController } from './group-resource.controller';
import { CreateUpdateGroupHandler } from '../../../User/Handler/create-update-group.handler';
import { LeaveGroupHandler } from '../../../User/Handler/leave-group.handler';
import { DeleteGroupHandler } from '../../../User/Handler/delete-group.handler';
import { GroupRepository } from '../../../User/Repository/group.repository';
import { Test } from '@nestjs/testing';
import { UserRepository } from '../../../User/Repository/user.repository';
import { PrismaService } from '../../../Common/Service/prisma.service';
import { getMockReq } from '@jest-mock/express';
import { AuthenticatedRequest } from '../../../Common/Type/authenticated-request';
import { Group } from '@prisma/client';

describe('GroupResourceController', () => {
  let controller: GroupResourceController;
  let createUpdateHandler: CreateUpdateGroupHandler;
  let leaveHandler: LeaveGroupHandler;
  let deleteHandler: DeleteGroupHandler;
  let groupRepository: GroupRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GroupResourceController],
      providers: [
        CreateUpdateGroupHandler,
        LeaveGroupHandler,
        DeleteGroupHandler,
        GroupRepository,
        UserRepository,
        PrismaService,
      ],
    }).compile();

    controller = moduleRef.get(GroupResourceController);
    createUpdateHandler = moduleRef.get(CreateUpdateGroupHandler);
    leaveHandler = moduleRef.get(LeaveGroupHandler);
    deleteHandler = moduleRef.get(DeleteGroupHandler);
    groupRepository = moduleRef.get(GroupRepository);
  });

  describe('resourceList', () => {
    it('returns empty list without filter', async () => {
      const request = getMockReq<AuthenticatedRequest>({
        user: {
          id: 1,
          email: 'test@test.com',
          firstName: 'Tester',
          lastName: 'Testerovic',
        },
      });

      const resourceList = await controller.resourceList(request);

      expect(resourceList).toEqual([]);
    });

    it('returns filtered groups', async () => {
      const request = getMockReq<AuthenticatedRequest>({
        user: {
          id: '1',
          email: 'test@test.com',
          firstName: 'Tester',
          lastName: 'Testerovic',
        },
      });

      const mockData = [{ test: true }] as unknown as Group[];

      jest
        .spyOn(groupRepository, 'findGroupsForUser')
        .mockImplementation(() => Promise.resolve(mockData));

      const resourceList = await controller.resourceList(request, 'test');

      expect(resourceList).toEqual(mockData);
    });
  });

  describe('createResource', () => {
    it('creates group', async () => {
      // TODO: Implement this function
    });
  });
});
