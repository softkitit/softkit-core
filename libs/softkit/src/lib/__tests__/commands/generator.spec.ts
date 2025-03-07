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
    beforeAll(() => {
      const nodefs = jest.requireActual('node:fs');

      const copyFolder = path.join(__dirname, 'apps');
      copyRealFsToMemfs(nodefs, fs, copyFolder, copyFolder);

      mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        return undefined as never;
      });
    });

    it('should have a command', async () => {
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
  });
});
