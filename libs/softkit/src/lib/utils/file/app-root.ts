import * as path from 'node:path';
import { fileExists } from './fileutils';
import { PACKAGE_JSON_FILE_NAME, SK_JSON_FILE_NAME } from '../../vo/constants';

/**
 * The root of the app
 */
export const appRoot = appRootInner(process.cwd(), process.cwd());

export function appRootInner(
  dir: string,
  candidateRoot: string | null,
): string {
  if (process.env['SK_APP_ROOT_PATH']) return process.env['SK_APP_ROOT_PATH'];
  if (path.dirname(dir) === dir && candidateRoot) return candidateRoot;

  const matches = [path.join(dir, SK_JSON_FILE_NAME), path.join(dir, 'sk')];

  if (matches.some((x) => fileExists(x))) {
    return dir;
  } else if (
    fileExists(path.join(dir, 'node_modules', 'sk', PACKAGE_JSON_FILE_NAME))
  ) {
    return appRootInner(path.dirname(dir), dir);
  } else {
    return appRootInner(path.dirname(dir), candidateRoot);
  }
}
