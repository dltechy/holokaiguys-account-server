import { Module } from '@nestjs/common';
import * as uuid from 'uuid';

import { uuidSymbol } from '../imports/imports.helper';
import { UuidHelper } from './uuid.helper';

@Module({
  providers: [
    UuidHelper,
    {
      provide: uuidSymbol,
      useValue: uuid,
    },
  ],
  exports: [UuidHelper],
})
export class UuidModule {}
