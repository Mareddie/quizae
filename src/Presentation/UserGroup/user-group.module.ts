import { Module } from '@nestjs/common';
import { GroupResourceController } from './Controller/group-resource.controller';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../../User/user.module';
import { UserResourceController } from './Controller/user-resource.controller';

@Module({
  imports: [ConfigModule, UserModule],
  controllers: [GroupResourceController, UserResourceController],
})
export class UserGroupModule {}
