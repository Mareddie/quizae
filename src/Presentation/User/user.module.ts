import { Module } from '@nestjs/common';
import { UserModule as UserDomainModule } from '../../User/user.module';
import { UserResourceController } from './Controller/user-resource.controller';

@Module({
  imports: [UserDomainModule],
  controllers: [UserResourceController],
})
export class UserModule {}
