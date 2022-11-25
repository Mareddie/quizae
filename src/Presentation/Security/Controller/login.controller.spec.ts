import { LoginController } from './login.controller';
import { Test } from '@nestjs/testing';
import { AuthService } from '../../../Auth/Service/auth.service';
import { getMockedAuthRequest } from '../../../../test/testUtils';

describe('LoginController', () => {
  let controller: LoginController;

  const authServiceMock = {
    generateToken: jest.fn().mockResolvedValue('authtoken'),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LoginController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return authServiceMock;
        }
      })
      .compile();

    controller = moduleRef.get(LoginController);
  });

  describe('loginUser', () => {
    it('logs user in', async () => {
      const req = getMockedAuthRequest();
      const token = await controller.loginUser(req);

      expect(authServiceMock['generateToken']).toHaveBeenCalledTimes(1);

      expect(authServiceMock['generateToken']).toHaveBeenCalledWith(req.user);

      expect(token).toMatchObject({ accessToken: 'authtoken' });
    });
  });
});
