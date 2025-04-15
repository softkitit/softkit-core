import type { Tree } from '../service/tree';

import { readJson } from './json';
import { SkJsonConfiguration } from '../vo/sk-json-configuration';
import { SK_JSON_FILE_NAME } from '../vo/constants';
import { logger } from './logger';

/**
 * Reads sk.json
 */
export function readSkJson(tree: Tree): SkJsonConfiguration {
  if (!tree.exists(SK_JSON_FILE_NAME)) {
    logger.warn(
      `No ${SK_JSON_FILE_NAME} found in the workspace, it might be a new project. Run "sk init" to initialize the workspace.`,
    );
    return {};
  }

  return readJson<SkJsonConfiguration>(tree, SK_JSON_FILE_NAME);
}
