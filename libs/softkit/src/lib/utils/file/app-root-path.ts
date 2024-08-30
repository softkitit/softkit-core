import * as path from 'node:path';
import { fileExists } from './fileutils';
import { PACKAGE_JSON_FILE_NAME, SK_JSON_FILE_NAME } from '../../vo/constants';
import * as process from 'node:process';
import { getAppRootPathEnv } from '../env';
import chalk from 'chalk';
import memoize from 'memoizee';

/**
 * The root of the app
 */
export const appRootPath = memoize(() => findAppRootInner(process.cwd()));

export function findAppRootInner(dir: string, candidate?: string): string {
  const appRootPathEnv = getAppRootPathEnv();
  if (appRootPathEnv) return appRootPathEnv;

  const skJsonFile = path.join(dir, SK_JSON_FILE_NAME);

  if (dir === candidate) {
    throw new Error(
      `Cannot find ${SK_JSON_FILE_NAME} in the parent directories of ${process.cwd()}.
       Seems like it's not initialized as a Softkit app.
       You most likely need to call ${chalk.bold(
         '"sk init"',
       )} in the directory that contains ${PACKAGE_JSON_FILE_NAME}.`,
    );
  }

  return fileExists(skJsonFile)
    ? dir
    : findAppRootInner(path.dirname(dir), dir);
}
