import { GenerateCommand } from '../../bin/commands/generate.command';
import process from 'node:process';
import { setAppRootPathEnv } from '../../utils/env';
import SpyInstance = jest.SpyInstance;
import * as path from 'node:path';

describe(`generator`, () => {
  const generateCommand = new GenerateCommand();

  let mockExit: SpyInstance;

  describe(`nest app base`, () => {
    beforeAll(() => {
      mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        return undefined as never;
      });
    });

    it('should have a command', async () => {
      setAppRootPathEnv(path.join(__dirname, 'apps', 'nest-app-base'));
      await generateCommand.handler({
        $0: '',
        _: [],
        generator: '@sample/nest-generator:app',
        dryRun: true,
        applicationName: 'some-app-name',
        verbose: true,
      });
    });
  });
});
