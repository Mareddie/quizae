import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { UserRepository } from './Repository/user.repository';
import { CreateGroupHandler } from './Handler/create-group.handler';

@Module({
  imports: [CommonModule],
  exports: [UserRepository, CreateGroupHandler],
  providers: [UserRepository, CreateGroupHandler],
})
export class UserModule {}
