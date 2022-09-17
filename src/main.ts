import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './Common/Service/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import flash = require('connect-flash');
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const publicPath = join(__dirname, '..', 'public');
  const viewsPath = join(__dirname, '..', 'views');
  const partialsPath = join(__dirname, '..', 'views/partials');

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.useStaticAssets(publicPath);
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('hbs');

  hbs.registerPartials(partialsPath);

  app.use(cookieParser(configService.get<string>('COOKIE_SECRET', 'changeme')));

  app.use(
    session({
      secret: configService.get<string>('APP_SECRET', 'changeme'),
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  await app.listen(3000);
}

bootstrap();
