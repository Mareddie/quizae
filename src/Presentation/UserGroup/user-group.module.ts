import { Module } from '@nestjs/common';
import { UserModule } from '../../User/user.module';
import { UserResourceController } from './Controller/user-resource.controller';

@Module({
  imports: [UserModule],
  controllers: [UserResourceController],
})
export class UserGroupModule {}
