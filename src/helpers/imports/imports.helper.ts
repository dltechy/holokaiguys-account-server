import { PassportStrategy } from '@nestjs/passport';
import axios from 'axios';
import * as fs from 'fs';
import { Strategy } from 'passport-discord';
import * as path from 'path';
import * as qs from 'qs';
import * as util from 'util';
import * as uuid from 'uuid';

export const axiosSymbol = Symbol.for('axios');
export type AxiosType = typeof axios;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const DiscordStrategy = PassportStrategy(Strategy);

export const fsSymbol = Symbol.for('fs');
export type FsType = typeof fs;
export type FsAsyncType = typeof fs.promises;

export const pathSymbol = Symbol.for('path');
export type PathType = typeof path;

export const qsSymbol = Symbol.for('qs');
export type QsType = typeof qs;

export const utilSymbol = Symbol.for('util');
export type UtilType = typeof util;
export type UtilPromisifyType = typeof util.promisify;

export const uuidSymbol = Symbol.for('uuid');
export type UuidType = typeof uuid;
export type Uuidv4Type = typeof uuid.v4;
