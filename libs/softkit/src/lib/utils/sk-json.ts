import type { Tree } from '../service/tree';

import { readJson } from './json';
import { SkJsonConfiguration } from '../vo/sk-json-configuration';
import { SK_JSON_FILE_NAME } from '../vo/constants';

/**
 * Reads sk.json
 */
export function readSkJson(tree: Tree): SkJsonConfiguration | undefined {
  if (!tree.exists(SK_JSON_FILE_NAME)) {
    return undefined;
  }

  return readJson<SkJsonConfiguration>(tree, SK_JSON_FILE_NAME);
}
