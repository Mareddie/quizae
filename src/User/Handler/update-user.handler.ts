import { Injectable } from '@nestjs/common';
import { UserRepository } from '../Repository/user.repository';
import { CreateUpdateUserDTO } from '../DTO/create-update-user.dto';
import { AuthenticatedUser } from '../Type/authenticated-user';
import * as argon2 from 'argon2';

@Injectable()
export class UpdateUserHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async updateUser(
    userId: string,
    data: CreateUpdateUserDTO,
  ): Promise<AuthenticatedUser> {
    if (data.password !== undefined) {
      data.password = await argon2.hash(data.password);
    }

    const user = await this.userRepository.updateUser(userId, data);

    delete user.password;

    return user as AuthenticatedUser;
  }
}
