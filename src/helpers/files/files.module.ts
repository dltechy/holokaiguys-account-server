import { Module } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { fsSymbol, pathSymbol } from '../imports/imports.helper';
import { FilesHelper } from './files.helper';

@Module({
  providers: [
    FilesHelper,
    {
      provide: fsSymbol,
      useValue: fs,
    },
    {
      provide: pathSymbol,
      useValue: path,
    },
  ],
  exports: [FilesHelper],
})
export class FilesModule {}
