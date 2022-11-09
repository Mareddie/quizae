import { Module } from '@nestjs/common';
import { PresentationModule } from './presentation/presentation.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PresentationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
