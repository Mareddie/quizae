import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './Common/Service/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const publicPath = join(__dirname, '..', 'public');
  const viewsPath = join(__dirname, '..', 'views');
  const partialsPath = join(__dirname, '..', 'views/partials');

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.useStaticAssets(publicPath);
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('hbs');

  hbs.registerPartials(partialsPath);

  await app.listen(3000);
}

bootstrap();
