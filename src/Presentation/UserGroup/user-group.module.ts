import { Module } from '@nestjs/common';
import { GroupResourceController } from './Controller/group-resource.controller';

@Module({
  imports: [],
  controllers: [GroupResourceController],
})
export class UserGroupModule {}
