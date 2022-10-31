import { LoginController } from './login.controller';
import { Test } from '@nestjs/testing';
import { CheckOriginGuard } from '../../../Common/Guard/check-origin.guard';
import { LocalAuthGuard } from '../../../Auth/Guard/local-auth.guard';
import { AuthService } from '../../../Auth/Service/auth.service';
import { Request } from 'express';

describe('LoginController', () => {
  let controller: LoginController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [AuthService],
    })
      .overrideGuard(CheckOriginGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(AuthService)
      .useValue({ generateToken: (user) => 'haha' })
      .compile();

    controller = moduleRef.get<LoginController>(LoginController);
  });

  describe('loginUser', () => {
    it('should return login', async () => {
      expect(await controller.loginUser({ user: {} } as Request)).toMatchObject(
        { accessToken: 'haha' },
      );
    });
  });
});
