import { Module } from '@nestjs/common';
import { AuthService } from './Service/auth.service';
import { UserModule } from '../User/user.module';
import { LocalStrategy } from './Strategy/local.strategy';
import { SessionSerializer } from './Serializer/session.serializer';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [UserModule, PassportModule],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
