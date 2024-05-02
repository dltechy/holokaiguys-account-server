import { INestApplicationContext } from '@nestjs/common';
import { useContainer } from 'class-validator';

export function initializeValidators(module: INestApplicationContext): void {
  useContainer(module, { fallbackOnErrors: true });
}
