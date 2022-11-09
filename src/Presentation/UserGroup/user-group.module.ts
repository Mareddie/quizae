import { Module } from '@nestjs/common';
import { GroupResourceController } from './Controller/group-resource.controller';
import { UserModule } from '../../User/user.module';
import { UserResourceController } from './Controller/user-resource.controller';

@Module({
  imports: [UserModule],
  controllers: [GroupResourceController, UserResourceController],
})
export class UserGroupModule {}
