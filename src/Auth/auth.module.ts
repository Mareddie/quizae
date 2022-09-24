import { Module } from '@nestjs/common';
import { AuthService } from './Service/auth.service';
import { UserModule } from '../User/user.module';
import { LocalStrategy } from './Strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './Strategy/jwt.strategy';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'changeme'),
        signOptions: { expiresIn: '60s' },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
