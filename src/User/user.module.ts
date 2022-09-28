import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { UserRepository } from './Repository/user.repository';
import { CreateUpdateGroupHandler } from './Handler/create-update-group.handler';
import { GroupRepository } from './Repository/group.repository';
import { DeleteGroupHandler } from './Handler/delete-group.handler';
import { LeaveGroupHandler } from './Handler/leave-group.handler';

@Module({
  imports: [CommonModule],
  exports: [
    UserRepository,
    CreateUpdateGroupHandler,
    LeaveGroupHandler,
    DeleteGroupHandler,
    GroupRepository,
  ],
  providers: [
    UserRepository,
    CreateUpdateGroupHandler,
    LeaveGroupHandler,
    DeleteGroupHandler,
    GroupRepository,
  ],
})
export class UserModule {}
