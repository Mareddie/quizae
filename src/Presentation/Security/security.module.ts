import { Module } from '@nestjs/common';
import { LoginController } from './Controller/login.controller';
import { UserModule } from '../../User/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, ConfigModule],
  controllers: [LoginController],
  providers: [],
})
export class SecurityModule {}
