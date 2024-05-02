import { DynamicModule, Type } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { RedisModule } from '@app/providers/redis/redis.module';

export function getSessionImports(): (Type | DynamicModule)[] {
  return [
    RedisModule,
    PassportModule.register({
      session: true,
    }),
  ];
}
