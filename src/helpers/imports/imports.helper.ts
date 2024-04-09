import * as fs from 'fs';
import * as path from 'path';
import * as qs from 'qs';
import * as uuid from 'uuid';

export const fsSymbol = Symbol.for('fs');
export type FsType = typeof fs;
export type FsAsyncType = typeof fs.promises;

export const pathSymbol = Symbol.for('path');
export type PathType = typeof path;

export const qsSymbol = Symbol.for('qs');
export type QsType = typeof qs;

export const uuidSymbol = Symbol.for('uuid');
export type UuidType = typeof uuid;
export type Uuidv4Type = typeof uuid.v4;
