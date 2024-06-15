import { Module } from '@nestjs/common';
import axios from 'axios';
import * as util from 'util';

import { FilesModule } from '@app/helpers/files/files.module';
import { axiosSymbol, utilSymbol } from '@app/helpers/imports/imports.helper';
import { UuidModule } from '@app/helpers/uuid/uuid.module';
import { RedisModule } from '@app/providers/redis/redis.module';

import { UsersDao } from '../users/users.dao';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BearerStrategy } from './bearer.strategy';
import { DiscordStrategy } from './discord.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UsersModule, RedisModule, FilesModule, UuidModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersDao,
    DiscordStrategy,
    BearerStrategy,
    SessionSerializer,
    {
      provide: axiosSymbol,
      useValue: axios,
    },
    {
      provide: utilSymbol,
      useValue: util,
    },
  ],
})
export class AuthModule {}
