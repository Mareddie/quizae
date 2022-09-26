import { PrismaService } from './Common/Service/prisma.service';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const env = configService.get<string>('APP_ENV', 'prod');

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // development environment specific settings
  if (env === 'dev') {
    app.disable('etag');
  }

  app.useGlobalPipes(
    new ValidationPipe({
      skipUndefinedProperties: true,
    }),
  );

  app.use(cookieParser(configService.get<string>('COOKIE_SECRET', 'changeme')));

  app.use(passport.initialize());

  await app.listen(3000);
}

bootstrap();
