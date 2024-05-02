import { Module } from '@nestjs/common';
import axios from 'axios';
import * as util from 'util';
import * as uuid from 'uuid';

import { FilesModule } from '@app/helpers/files/files.module';
import {
  axiosSymbol,
  utilSymbol,
  uuidSymbol,
} from '@app/helpers/imports/imports.helper';

import { UsersDao } from '../users/users.dao';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscordStrategy } from './discord.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UsersModule, FilesModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersDao,
    DiscordStrategy,
    SessionSerializer,
    {
      provide: axiosSymbol,
      useValue: axios,
    },
    {
      provide: utilSymbol,
      useValue: util,
    },
    {
      provide: uuidSymbol,
      useValue: uuid,
    },
  ],
})
export class AuthModule {}
