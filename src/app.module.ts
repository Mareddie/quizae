import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './User/user.module';
import { CommonModule } from './Common/common.module';

@Module({
  imports: [CommonModule, UserModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
