import { Module } from '@nestjs/common';
import { SecurityModule } from './Security/security.module';
import { UserGroupModule } from './UserGroup/user-group.module';

@Module({
  imports: [SecurityModule, UserGroupModule],
})
export class PresentationModule {}
