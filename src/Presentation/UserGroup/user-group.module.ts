import { Module } from '@nestjs/common';
import { GroupResourceController } from './Controller/group-resource.controller';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../../User/user.module';

@Module({
  imports: [ConfigModule.forRoot(), UserModule],
  controllers: [GroupResourceController],
})
export class UserGroupModule {}
