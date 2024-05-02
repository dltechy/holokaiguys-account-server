import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';

import { validate } from './config/config.validation';
import { FILES_DIRECTORY, FILES_SERVE_ROOT } from './constants/file.constants';
import { ValidateMaxQueryCount } from './helpers/validators/validate-max-query-count.helper';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './providers/prisma/prisma.module';
import { RedisModule } from './providers/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ServeStaticModule.forRoot({
      rootPath: FILES_DIRECTORY,
      serveRoot: FILES_SERVE_ROOT,
    }),
    PrismaModule,
    RedisModule,
    PassportModule.register({
      session: true,
    }),

    AuthModule,
    UsersModule,
  ],
  providers: [ValidateMaxQueryCount],
})
export class AppModule {}
