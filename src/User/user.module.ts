import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { UserRepository } from './Repository/user.repository';
import { UpdateUserHandler } from './Handler/update-user.handler';

@Module({
  imports: [CommonModule],
  exports: [UserRepository, UpdateUserHandler],
  providers: [UserRepository, UpdateUserHandler],
})
export class UserModule {}
