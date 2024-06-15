import { Inject, Injectable } from '@nestjs/common';

import { uuidSymbol, UuidType, Uuidv4Type } from '../imports/imports.helper';

@Injectable()
export class UuidHelper {
  private readonly uuidv4: Uuidv4Type;

  constructor(@Inject(uuidSymbol) uuid: UuidType) {
    this.uuidv4 = uuid.v4;
  }

  public generate(): string {
    return this.uuidv4().replaceAll('-', '');
  }
}
