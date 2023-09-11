import { spawnAsync } from './spawn-async';

export async function runLint(
  projectName: string,
  lintTargetName: string,
  cwd?: string,
) {
  await spawnAsync('yarn', [
    ...(cwd ? ['--cwd', cwd] : []),
    'nx',
    'run',
    `${projectName}:${lintTargetName}`,
    '--fix',
  ]);
}
