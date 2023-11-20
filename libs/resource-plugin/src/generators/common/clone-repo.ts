import { logger } from '@nx/devkit';
import { spawnAsync } from './spawn-async';
import { FsTree } from 'nx/src/generators/tree';

export async function cloneRepo(root: string, tag: string, repository: string) {
  await spawnAsync('git', [
    'clone',
    '--depth',
    '1',
    '--branch',
    tag,
    repository,
    root,
  ]);

  const gitFolderPath = '.git';

  const fsTree = new FsTree(root, true);

  /* istanbul ignore next */ if (!fsTree.exists(gitFolderPath)) {
    logger.warn(`The .git directory does not exist at ${gitFolderPath}`);
  }

  fsTree.delete(gitFolderPath);

  return fsTree;
}
