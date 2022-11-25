import { AuthService } from './auth.service';
import { UserRepository } from '../../User/Repository/user.repository';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const mockedUser = {
    id: '123',
    email: 'testing@test.com',
    // testingpassword
    password:
      '$argon2id$v=19$m=4096,t=3,p=1$wX4T0XbC72RxEJZERxLLcA$5f/wMHmPHxxn64RbdeGA+6Is2h91uB2NwQ9ccDZXq38',
    firstName: 'Unit',
    lastName: 'Tester',
  };

  const userRepositoryMock = {
    findByEmail: jest.fn().mockImplementation((email) => {
      if (email === 'usernotfound@test.com') {
        return null;
      }

      return mockedUser;
    }),
  };

  const jwtServiceMock = {
    signAsync: jest.fn().mockResolvedValue('signedstring'),
  };

  beforeEach(async () => {
    service = new AuthService(
      userRepositoryMock as unknown as UserRepository,
      jwtServiceMock as unknown as JwtService,
    );
  });

  describe('validateUser', () => {
    it('does not find user', async () => {
      const authUser = await service.validateUser(
        'usernotfound@test.com',
        'testingpassword',
      );

      expect(userRepositoryMock['findByEmail']).toHaveBeenCalledTimes(1);

      expect(userRepositoryMock['findByEmail']).toHaveBeenCalledWith(
        'usernotfound@test.com',
      );

      expect(authUser).toEqual(null);
    });

    it('does not verify password', async () => {
      const authUser = await service.validateUser(
        'testing@test.com',
        'invalidpassword',
      );

      expect(userRepositoryMock['findByEmail']).toHaveBeenCalledTimes(2);

      expect(userRepositoryMock['findByEmail']).toHaveBeenCalledWith(
        'testing@test.com',
      );

      expect(authUser).toEqual(null);
    });

    it('validates user correctly', async () => {
      const authUser = await service.validateUser(
        'testing@test.com',
        'testingpassword',
      );

      expect(userRepositoryMock['findByEmail']).toHaveBeenCalledTimes(3);

      expect(userRepositoryMock['findByEmail']).toHaveBeenCalledWith(
        'testing@test.com',
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...mockAuthUser } = mockedUser;

      expect(authUser).toMatchObject(mockAuthUser);
    });
  });

  describe('generateToken', () => {
    it('generates token', async () => {
      const token = await service.generateToken(mockedUser);

      expect(jwtServiceMock['signAsync']).toHaveBeenCalledTimes(1);

      expect(jwtServiceMock['signAsync']).toHaveBeenCalledWith(
        {
          username: mockedUser.email,
          sub: mockedUser.id,
        },
        { expiresIn: '4h' },
      );

      expect(token).toEqual('signedstring');
    });
  });
});
