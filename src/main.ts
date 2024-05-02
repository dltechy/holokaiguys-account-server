import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfig } from './config/interfaces/app.config';
import { initializeCookies } from './helpers/initialization/cookies-initialization.helper';
import { initializeCors } from './helpers/initialization/cors-initialization.helper';
import { initializeGlobalPipes } from './helpers/initialization/global-pipes-initialization.helper';
import { initializePrisma } from './helpers/initialization/prisma-initialization.helper';
import { initializeSession } from './helpers/initialization/session-initialization.helper';
import { initializeSwagger } from './helpers/initialization/swagger-initialization.helper';
import { initializeValidators } from './helpers/initialization/validators-initialization.helper';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const { port } = configService.get<AppConfig>('app');

  initializeCors(app);
  initializeCookies(app);
  initializePrisma(app);
  initializeSession(app);
  initializeValidators(app.select(AppModule));
  initializeGlobalPipes(app);
  initializeSwagger(app);

  await app.listen(port);
}
bootstrap();
