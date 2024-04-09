import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  validateSync,
} from 'class-validator';

import { AppConfig } from './interfaces/app.config';
import { DatabaseConfig } from './interfaces/database.config';
import { RedisConfig } from './interfaces/redis.config';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  public NODE_ENV: Environment;

  @IsInt()
  public PORT: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public APP_NAME?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public APP_CORS_ORIGIN?: string;

  @ValidateIf(
    (env: EnvironmentVariables) => env.NODE_ENV === Environment.Development,
  )
  @IsString()
  @IsNotEmpty()
  public APP_BASE_URL: string;

  @IsString()
  @IsNotEmpty()
  public DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  public REDIS_HOST: string;

  @IsInt()
  public REDIS_PORT: number;

  @IsInt()
  @IsOptional()
  public REDIS_DB_INDEX: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public REDIS_PASSWORD?: string;
}

function parseCorsOrigin(rawCorsOrigin?: string): AppConfig['corsOrigin'] {
  if (rawCorsOrigin == null) {
    return null;
  }

  const output = rawCorsOrigin.split(',').map((value) => {
    if (value.startsWith('/') && value.endsWith('/')) {
      return new RegExp(value.substring(1, value.length - 1));
    }
    return value;
  });

  return output;
}

export function validate(config: Record<string, unknown>): {
  app: AppConfig;
  db: DatabaseConfig;
  redis: RedisConfig;
} {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig);

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return {
    app: {
      nodeEnv: validatedConfig.NODE_ENV,
      port: validatedConfig.PORT,
      name: validatedConfig.APP_NAME,
      corsOrigin: parseCorsOrigin(validatedConfig.APP_CORS_ORIGIN),
      baseUrl: validatedConfig.APP_BASE_URL,
    },
    db: {
      url: validatedConfig.DATABASE_URL,
    },
    redis: {
      host: validatedConfig.REDIS_HOST,
      port: validatedConfig.REDIS_PORT,
      dbIndex: validatedConfig.REDIS_DB_INDEX,
      password: validatedConfig.REDIS_PASSWORD,
    },
  };
}
