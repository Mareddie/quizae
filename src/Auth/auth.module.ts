import { Module } from '@nestjs/common';
import { AuthService } from './Service/auth.service';
import { UserModule } from '../User/user.module';
import { LocalStrategy } from './Strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './Strategy/jwt.strategy';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtModuleFactory,
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

// We can safely ignore factory methods
/* istanbul ignore next */
async function jwtModuleFactory(configService: ConfigService) {
  return {
    secret: configService.get<string>('JWT_SECRET', 'changeme'),
    signOptions: { expiresIn: '60s' },
  };
}
