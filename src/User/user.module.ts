import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { UserRepository } from './Repository/user.repository';
import { CreateGroupHandler } from './Handler/create-group.handler';
import { GroupRepository } from './Repository/group.repository';
import { UpdateGroupHandler } from './Handler/update-group.handler';
import { DeleteGroupHandler } from './Handler/delete-group.handler';

@Module({
  imports: [CommonModule],
  exports: [
    UserRepository,
    CreateGroupHandler,
    UpdateGroupHandler,
    DeleteGroupHandler,
    GroupRepository,
  ],
  providers: [
    UserRepository,
    CreateGroupHandler,
    UpdateGroupHandler,
    DeleteGroupHandler,
    GroupRepository,
  ],
})
export class UserModule {}
