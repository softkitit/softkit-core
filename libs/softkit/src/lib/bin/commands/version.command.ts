import yargs from 'yargs';
import { exec } from 'node:child_process';
import { logger } from '../../utils/logger';

/**
 * Shows softkit version.
 */
export class VersionCommand implements yargs.CommandModule {
  command = 'version';
  describe = 'Prints Softkit version this project uses.';

  protected static executeCommand(command: string) {
    return new Promise<string>((ok, fail) => {
      exec(command, (error: unknown, stdout: string, stderr: string) => {
        if (stdout) return ok(stdout);
        if (stderr) return ok(stderr);
        if (error) return fail(error);
        ok('');
      });
    });
  }

  // eslint-disable-next-line complexity
  async handler() {
    const localNpmList =
      await VersionCommand.executeCommand('npm list --depth=0');
    const localMatches = localNpmList.match(/ softkit@(.*)\n/);
    const localNpmVersion = (
      localMatches && localMatches[1] ? localMatches[1] : ''
    )
      .replaceAll(/"invalid"/gi, '')
      .trim();

    const globalNpmList = await VersionCommand.executeCommand(
      'npm list -g --depth=0',
    );
    const globalMatches = globalNpmList.match(/ softkit@(.*)\n/);
    const globalNpmVersion = (
      globalMatches && globalMatches[1] ? globalMatches[1] : ''
    )
      .replaceAll(/"invalid"/gi, '')
      .trim();

    if (localNpmVersion) {
      logger.log('Local installed version:', localNpmVersion);
    } else {
      logger.log('No local installed was found.');
    }
    if (globalNpmVersion) {
      logger.log('Global installed softkit module version:', globalNpmVersion);
    } else {
      logger.log('No global installed was found.');
    }

    if (
      localNpmVersion &&
      globalNpmVersion &&
      localNpmVersion !== globalNpmVersion
    ) {
      logger.log(
        'To avoid issues with CLI please make sure your global and local versions match',
      );
    }
  }
}
