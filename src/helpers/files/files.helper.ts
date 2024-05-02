import { Inject, Injectable } from '@nestjs/common';

import {
  FILES_DIRECTORY,
  FilesSubdirectory,
} from '@app/constants/file.constants';

import {
  FsAsyncType,
  fsSymbol,
  FsType,
  pathSymbol,
  PathType,
} from '../imports/imports.helper';

@Injectable()
export class FilesHelper {
  private readonly fsAsync: FsAsyncType;

  constructor(
    @Inject(fsSymbol) private readonly fs: FsType,
    @Inject(pathSymbol) private readonly path: PathType,
  ) {
    this.fsAsync = this.fs.promises;
  }

  public exists(subdirectory: FilesSubdirectory, filename: string): boolean {
    const dirPath = this.path.resolve(FILES_DIRECTORY, subdirectory);
    const filePath = this.path.resolve(dirPath, filename);

    return this.fs.existsSync(filePath);
  }

  public async save(
    subdirectory: FilesSubdirectory,
    filename: string,
    data: string,
  ): Promise<void> {
    const dirPath = this.path.resolve(FILES_DIRECTORY, subdirectory);
    const filePath = this.path.resolve(dirPath, filename);

    await this.fsAsync.mkdir(dirPath, {
      recursive: true,
    });

    await this.fsAsync.writeFile(filePath, data);
  }

  public async delete(
    subdirectory: FilesSubdirectory,
    filename: string,
  ): Promise<void> {
    const dirPath = this.path.resolve(FILES_DIRECTORY, subdirectory);
    const filePath = this.path.resolve(dirPath, filename);

    if (!this.fs.existsSync(filePath)) {
      return;
    }

    await this.fsAsync.rm(filePath);
  }
}
