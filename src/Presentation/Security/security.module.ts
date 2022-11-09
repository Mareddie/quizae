import { Module } from '@nestjs/common';
import { LoginController } from './Controller/login.controller';
import { UserModule } from '../../User/user.module';
import { AuthModule } from '../../Auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [LoginController],
  providers: [],
})
export class SecurityModule {}
