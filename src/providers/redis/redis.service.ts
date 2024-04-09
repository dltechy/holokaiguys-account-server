import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { RedisConfig } from '@app/config/interfaces/redis.config';

@Injectable()
export class RedisService extends Redis implements OnApplicationShutdown {
  constructor(configService: ConfigService) {
    const { host, port, dbIndex, password } =
      configService.get<RedisConfig>('redis');

    super({
      host,
      port,
      db: dbIndex,
      password,
    });
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.quit();
  }
}
