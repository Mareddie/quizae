import { Module } from '@nestjs/common';
import { LoginController } from './Controller/login.controller';
import { UserModule } from '../../User/user.module';

@Module({
  imports: [UserModule],
  controllers: [LoginController],
  providers: [],
})
export class SecurityModule {}
