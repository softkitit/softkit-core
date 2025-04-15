import { fs } from 'memfs';
import { GenerateCommand } from '../../bin/commands/generate.command';
import process from 'node:process';
import { setAppRootPathEnv } from '../../utils/env';
import SpyInstance = jest.SpyInstance;
import * as path from 'node:path';
import { copyRealFsToMemfs } from '../utils/file-utils';

// both needed because of fs-extra library usage
jest.mock('node:fs', () => fs);
jest.mock('fs', () => fs);

describe(`generator`, () => {
  const generateCommand = new GenerateCommand();

  let mockExit: SpyInstance;

  describe(`nest app base`, () => {
    beforeEach(() => {
      const nodeFS = jest.requireActual('node:fs');

      const copyFolder = path.join(__dirname, 'apps');
      copyRealFsToMemfs(nodeFS, fs, copyFolder, copyFolder);

      mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        return undefined as never;
      });
    });

    it('should execute an installed generator', async () => {
      const rootPath = path.join(__dirname, 'apps', 'nest-app-base');
      setAppRootPathEnv(rootPath);
      await generateCommand.handler({
        $0: '',
        _: [],
        generator: '@sample/nest-generator:app',
        dryRun: true,
        applicationName: 'some-app-name',
        verbose: true,
      });

      expect(
        fs.readFileSync(path.join(rootPath, 'src', 'app.module.ts')).toString(),
      ).toBe("import { Module } from '@nestjs/common'");
    });

    it('should execute a local generator with pnpm', async () => {
      const rootPath = path.join(
        __dirname,
        'apps',
        'nest-app-pnpm-base-local-generator',
      );
      setAppRootPathEnv(rootPath);
      await generateCommand.handler({
        $0: '',
        _: [],
        generator: 'test',
        dryRun: true,
        applicationName: 'some-app-name',
        verbose: true,
      });

      expect(
        fs.readFileSync(path.join(rootPath, 'src', 'app.module.ts')).toString(),
      ).toBe("import { Module } from '@nestjs/common'");
    });
  });
});
