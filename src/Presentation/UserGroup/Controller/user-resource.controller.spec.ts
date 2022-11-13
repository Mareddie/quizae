import { UserResourceController } from './user-resource.controller';
import { Test } from '@nestjs/testing';
import { UpdateUserHandler } from '../../../User/Handler/update-user.handler';
import { getMockedAuthRequest } from '../../../../test/testUtils';
import { CreateUpdateUserDTO } from '../../../User/DTO/create-update-user.dto';

describe('UserResourceController', () => {
  let controller: UserResourceController;

  const updateUserHandlerMock = {
    updateUser: jest.fn().mockResolvedValue({ test: true }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserResourceController],
    })
      .useMocker((token) => {
        if (token === UpdateUserHandler) {
          return updateUserHandlerMock;
        }
      })
      .compile();

    controller = moduleRef.get(UserResourceController);
  });

  describe('getProfile', () => {
    it('fetches user profile', async () => {
      const req = getMockedAuthRequest();
      const profile = await controller.getProfile(req);

      expect(profile).toMatchObject(req.user);
    });
  });

  describe('updateProfile', () => {
    it('updates user profile', async () => {
      const dto = new CreateUpdateUserDTO();

      dto.email = 'testing@updated.com';
      dto.firstName = 'Firstname';
      dto.lastName = 'Lastname';

      await controller.updateProfile(getMockedAuthRequest(), dto);

      expect(updateUserHandlerMock['updateUser']).toHaveBeenCalledTimes(1);

      expect(updateUserHandlerMock['updateUser']).toHaveBeenCalledWith(
        '1',
        dto,
      );
    });
  });
});
