import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { UserRepository } from './Repository/user.repository';
import { CreateGroupHandler } from './Handler/create-group.handler';
import { GroupRepository } from './Repository/group.repository';

@Module({
  imports: [CommonModule],
  exports: [UserRepository, CreateGroupHandler, GroupRepository],
  providers: [UserRepository, CreateGroupHandler, GroupRepository],
})
export class UserModule {}
