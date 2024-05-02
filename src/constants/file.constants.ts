import * as path from 'path';

export const FILES_DIRECTORY = path.resolve(__dirname, '..', '..', 'files');

export const FILES_SERVE_ROOT = '/files';

export enum FilesSubdirectory {
  Avatars = 'avatars',
}
