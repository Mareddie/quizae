import { UpdateUserHandler } from './update-user.handler';
import { UserRepository } from '../Repository/user.repository';
import { plainToClass } from 'class-transformer';
import { CreateUpdateUserDTO } from '../DTO/create-update-user.dto';

describe('UpdateUserHandler', () => {
  const repositoryMock = {
    updateUser: jest.fn().mockResolvedValue({
      id: '123',
      email: 'testing@test.com',
      password: 'somepasswordupdated',
      firstName: 'Testus',
      lastName: 'Oh yes',
    }),
  };

  let handler: UpdateUserHandler;

  beforeEach(() => {
    handler = new UpdateUserHandler(
      repositoryMock as unknown as UserRepository,
    );
  });

  describe('updateUser', () => {
    it('updates user', async () => {
      const dto = plainToClass(CreateUpdateUserDTO, {
        email: 'testing@test.com',
        password: 'somepasswordupdated',
        firstName: 'Testus',
        lastName: 'Oh yes',
      });

      const result = await handler.updateUser('123', dto);

      console.log(result);

      expect(repositoryMock['updateUser']).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          password: expect.any(String),
        }),
      );

      expect(result).toMatchObject({
        id: expect.any(String),
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
    });
  });
});
