import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnAsync } from './spawn-async';
import fs from 'node:fs';

export async function cloneRepo(root: string, tag: string, repository: string) {
  try {
    await spawnAsync('git', [
      'clone',
      '--depth',
      '1',
      '--branch',
      tag,
      repository,
      root,
    ]);

    const gitFolderPath = join(root, '.git');
    if (existsSync(gitFolderPath)) {
      fs.rm(gitFolderPath, { recursive: true, force: true }, (err) => {
        if (err) {
          throw err;
        }
        // eslint-disable-next-line no-console
        console.log(`${gitFolderPath} is deleted`);
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error cloning repository: ${JSON.stringify(error)}`);
    throw error;
  }
}
