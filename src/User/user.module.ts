import { Module } from '@nestjs/common';
import { CommonModule } from '../Common/common.module';
import { UserRepository } from './Repository/user.repository';

@Module({
  imports: [CommonModule],
  exports: [UserRepository],
  providers: [UserRepository],
})
export class UserModule {}
