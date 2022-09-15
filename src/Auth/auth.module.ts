import { Module } from '@nestjs/common';
import { AuthService } from './Service/auth.service';
import { UserModule } from '../User/user.module';

@Module({
  imports: [UserModule],
  providers: [AuthService],
})
export class AuthModule {}
