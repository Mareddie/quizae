import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './User/user.module';
import { CommonModule } from './Common/common.module';
import { PresentationModule } from './presentation/presentation.module';
import { AuthModule } from './Auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CommonModule,
    UserModule,
    PresentationModule,
    AuthModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
