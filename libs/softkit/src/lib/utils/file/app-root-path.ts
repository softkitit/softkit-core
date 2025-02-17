import * as path from 'node:path';
import { fileExists } from './fileutils';
import { SK_JSON_FILE_NAME } from '../../vo/constants';
import * as process from 'node:process';
import { getAppRootPathEnv } from '../env';
import chalk from 'chalk';
import memoize from 'memoizee';
import { logger } from '../logger';

/**
 * The root of the app
 */
export const appRootPath = memoize(() => findAppRootInner(process.cwd()));

export function findAppRootInner(dir: string, candidate?: string): string {
  const appRootPathEnv = getAppRootPathEnv();
  if (appRootPathEnv) return appRootPathEnv;

  const skJsonFile = path.join(dir, SK_JSON_FILE_NAME);

  if (dir === candidate) {
    logger.error(
      `Cannot find "${SK_JSON_FILE_NAME}" in the parent directories of ${process.cwd()}
       Seems like it's not initialized as a Softkit app.
       You need to call ${chalk.bold(
         '"sk init"',
       )} in the root directory of the project `,
    );
    process.exit(1);
  }

  return fileExists(skJsonFile)
    ? dir
    : findAppRootInner(path.dirname(dir), dir);
}
