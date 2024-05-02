import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersDao } from './users.dao';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersDao],
  exports: [UsersDao],
})
export class UsersModule {}
