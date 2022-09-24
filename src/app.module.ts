import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './User/user.module';
import { CommonModule } from './Common/common.module';
import { PresentationModule } from './presentation/presentation.module';
import { AuthModule } from './Auth/auth.module';

@Module({
  imports: [CommonModule, UserModule, PresentationModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
